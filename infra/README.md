# Easeful AWS Infrastructure

This directory contains the initial Terraform configuration for the Easeful frontend.

## What It Creates

This phase creates frontend-only AWS infrastructure for a React/Vite static build:

- A private S3 bucket for built frontend assets
- S3 public access blocking
- A CloudFront distribution
- CloudFront Origin Access Control
- A bucket policy that allows CloudFront read access only
- Outputs for the bucket name, CloudFront distribution ID, and CloudFront domain name

Backend infrastructure, custom domains, and certificates are intentionally out of scope.

## Local Variables

Create a local variables file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with environment-specific values. The S3 bucket name must be globally unique.

Do not commit real `.tfvars` files, Terraform state files, credentials, account IDs, access keys, API keys, or other sensitive values.

## Terraform Commands

From this directory, format the configuration:

```bash
terraform fmt
```

Initialise Terraform:

```bash
terraform init
```

Validate the configuration:

```bash
terraform validate
```

Review the planned AWS changes before applying:

```bash
terraform plan
```
