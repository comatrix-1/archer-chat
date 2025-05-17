/*
  Warnings:

  - The `employmentType` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationType` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `proficiency` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'SELF_EMPLOYED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'SOFT', 'LANGUAGE');

-- AlterTable Experience
-- Step 1: Add new enum columns with temporary names
ALTER TABLE "Experience"
ADD COLUMN "employmentType_enum" "EmploymentType",
ADD COLUMN "locationType_enum" "LocationType";

-- Step 2: Update temporary enum columns from old string columns
-- For Experience.employmentType
UPDATE "Experience"
SET "employmentType_enum" = CASE "employmentType"
    WHEN 'Full-time' THEN 'FULL_TIME'::"EmploymentType"
    WHEN 'Part-time' THEN 'PART_TIME'::"EmploymentType"
    WHEN 'Contract' THEN 'CONTRACT'::"EmploymentType"
    WHEN 'Internship' THEN 'INTERNSHIP'::"EmploymentType"
    WHEN 'Freelance' THEN 'FREELANCE'::"EmploymentType"
    WHEN 'Self-employed' THEN 'SELF_EMPLOYED'::"EmploymentType"
    WHEN '' THEN NULL -- Map empty strings to NULL
    ELSE NULL       -- All other unmapped strings become NULL
END;

-- For Experience.locationType
UPDATE "Experience"
SET "locationType_enum" = CASE "locationType"
    WHEN 'On-site' THEN 'ON_SITE'::"LocationType"
    WHEN 'Remote' THEN 'REMOTE'::"LocationType"
    WHEN 'Hybrid' THEN 'HYBRID'::"LocationType"
    WHEN '' THEN NULL -- Map empty strings to NULL
    ELSE NULL       -- All other unmapped strings become NULL
END;

-- Step 3: Drop old string columns
ALTER TABLE "Experience"
DROP COLUMN "employmentType",
DROP COLUMN "locationType";

-- Step 4: Rename new enum columns to original names
ALTER TABLE "Experience"
RENAME COLUMN "employmentType_enum" TO "employmentType";
ALTER TABLE "Experience"
RENAME COLUMN "locationType_enum" TO "locationType";


-- AlterTable
-- Step 1: Add new enum columns with temporary names
ALTER TABLE "Skill"
ADD COLUMN "proficiency_enum" "SkillProficiency",
ADD COLUMN "category_enum" "SkillCategory" DEFAULT 'TECHNICAL'; -- Apply default for category

-- Step 2: Update temporary enum columns from old string columns
-- For Skill.proficiency
UPDATE "Skill"
SET "proficiency_enum" = CASE "proficiency"
    WHEN 'Beginner' THEN 'BEGINNER'::"SkillProficiency"
    WHEN 'Intermediate' THEN 'INTERMEDIATE'::"SkillProficiency"
    WHEN 'Experienced' THEN 'ADVANCED'::"SkillProficiency"
    WHEN 'Advanced' THEN 'ADVANCED'::"SkillProficiency"
    WHEN 'Expert' THEN 'EXPERT'::"SkillProficiency"
    WHEN 'N/A' THEN NULL -- Map "N/A" to NULL
    WHEN '' THEN NULL    -- Map empty strings to NULL
    ELSE NULL          -- All other unmapped strings become NULL
END;

-- For Skill.category
UPDATE "Skill"
SET "category_enum" = CASE "category"
    WHEN 'Technical' THEN 'TECHNICAL'::"SkillCategory"
    WHEN 'Language' THEN 'LANGUAGE'::"SkillCategory"
    WHEN 'Laboratory' THEN 'TECHNICAL'::"SkillCategory" -- Assuming Laboratory maps to Technical
    WHEN 'Interests' THEN 'SOFT'::"SkillCategory"      -- Assuming Interests maps to Soft
    WHEN 'Other' THEN 'SOFT'::"SkillCategory"        -- Assuming Other maps to Soft
    -- Old NULL, empty string, or any other unmapped string for category will result in 'TECHNICAL' due to the ELSE clause.
    -- This aligns with the column's default.
    ELSE 'TECHNICAL'::"SkillCategory"
END;

-- Step 3: Drop old string columns
ALTER TABLE "Skill"
DROP COLUMN "proficiency",
DROP COLUMN "category";

-- Step 4: Rename new enum columns to original names
ALTER TABLE "Skill"
RENAME COLUMN "proficiency_enum" TO "proficiency";
ALTER TABLE "Skill"
RENAME COLUMN "category_enum" TO "category";
