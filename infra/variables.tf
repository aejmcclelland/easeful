variable "aws_region" {
  description = "AWS region for regional frontend resources."
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Project name used for resource naming and tags."
  type        = string
  default     = "easeful"
}

variable "frontend_bucket_name" {
  description = "Globally unique S3 bucket name for built frontend assets."
  type        = string
}
