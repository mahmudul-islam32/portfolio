---
title: "Writing a least-privilege AWS IAM policy for one S3 bucket"
description: "How to give an application access to exactly one S3 bucket and prefix with an IAM policy, test it with the AWS CLI and avoid the common s3:* shortcut."
date: 2026-11-26
tags: [cloud, aws, iam, security]
lang: en
---

## The shortcut that keeps showing up

When an application needs to read and write files in S3, the quickest fix is to attach the managed `AmazonS3FullAccess` policy to its role, or to write a policy with `"Action": "s3:*"` and `"Resource": "*"`. It works on the first try, which is exactly the problem. That role can now list, read, overwrite and delete objects in every bucket in the account, change bucket policies and turn off encryption settings. If the application's credentials leak, so does everything else in S3.

Least privilege means the role gets only the actions it actually uses, on only the resources it actually touches. For a typical upload service that is a handful of actions on one bucket, often one prefix inside it.

## Know the two kinds of S3 resources

The detail that trips most people up is that S3 permissions apply to two different resource types:

- **The bucket** — `arn:aws:s3:::my-app-uploads`. Actions like `s3:ListBucket` and `s3:GetBucketLocation` apply here.
- **Objects in the bucket** — `arn:aws:s3:::my-app-uploads/*`. Actions like `s3:GetObject`, `s3:PutObject` and `s3:DeleteObject` apply here.

If you put `s3:GetObject` on the bucket ARN without `/*`, or `s3:ListBucket` on the object ARN, the statement silently grants nothing and you get `AccessDenied`. Keeping the two in separate statements makes the policy easier to read and review.

## A policy scoped to one bucket and prefix

Say the service stores user uploads under `uploads/` in the bucket `my-app-uploads`. It needs to list that prefix, read and write objects, and delete them. Here is the policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOnlyTheUploadsPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-app-uploads",
      "Condition": {
        "StringLike": { "s3:prefix": ["uploads/", "uploads/*"] }
      }
    },
    {
      "Sid": "ReadWriteObjectsUnderUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-uploads/uploads/*"
    }
  ]
}
```

The `s3:prefix` condition key limits which keys the role may list, so it cannot enumerate other folders in the same bucket. The object statement uses the prefix in the ARN itself, so reads and writes outside `uploads/` are denied by default. Nothing here lets the role change bucket settings, policies or ACLs.

If the service only reads, drop `PutObject` and `DeleteObject`. If it never deletes, leave `DeleteObject` out and let a lifecycle rule handle cleanup instead. Every action you remove is one less thing a leaked key can do.

## Attach it to a role, not a user

Create the policy and attach it to the role the application runs as (an EC2 instance profile, an ECS task role, or a Kubernetes service account through IRSA or EKS Pod Identity), so no long-lived access keys are involved:

```bash
aws iam create-policy \
  --policy-name my-app-uploads-rw \
  --policy-document file://uploads-policy.json

aws iam attach-role-policy \
  --role-name my-app-role \
  --policy-arn arn:aws:iam::123456789012:policy/my-app-uploads-rw
```

Replace the account ID with your own. Short-lived role credentials rotate automatically, which removes a whole class of "key committed to Git" incidents.

## Test what is allowed and what is not

Do not stop at "the app works". Check that the denials work too. With a profile that assumes the role, run:

```bash
# Should succeed
aws s3 ls s3://my-app-uploads/uploads/ --profile my-app
echo test > t.txt
aws s3 cp t.txt s3://my-app-uploads/uploads/t.txt --profile my-app

# Should fail with AccessDenied
aws s3 ls s3://my-app-uploads/ --profile my-app
aws s3 cp t.txt s3://my-app-uploads/other/t.txt --profile my-app
aws s3 ls --profile my-app
```

Listing the bucket root fails because `""` does not match the allowed prefixes. Writing to `other/` fails because no statement covers that ARN. Listing all buckets fails because `s3:ListAllMyBuckets` was never granted.

You can also test without touching real data using the policy simulator from the CLI:

```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/my-app-role \
  --action-names s3:GetObject s3:DeleteBucket \
  --resource-arns arn:aws:s3:::my-app-uploads/uploads/a.png
```

Each action comes back as `allowed` or `implicitDeny`, which is handy in a CI check for policy changes.

## A few extras worth adding

- **KMS keys.** If the bucket uses SSE-KMS with a customer managed key, the role also needs `kms:Decrypt` (to read) and `kms:GenerateDataKey` (to write) on that specific key ARN. Missing these gives an `AccessDenied` that looks like an S3 problem.
- **Bucket policy guardrails.** Keep S3 Block Public Access turned on, and consider a bucket policy that denies requests where `aws:SecureTransport` is `false`, so plain HTTP is refused.
- **Find unused permissions.** IAM shows "last accessed" information for services and, for S3, for actions. IAM Access Analyzer can also generate a policy from CloudTrail activity. Both help trim a policy that grew too wide over time.

## Wrapping up

A least-privilege S3 policy is not much longer than `s3:*`. Split bucket and object ARNs, scope by prefix, grant only the actions the code calls, attach it to a role, and test the denials as carefully as the happy path. It takes ten extra minutes once, and it turns a leaked credential from an account-wide incident into a contained one.
