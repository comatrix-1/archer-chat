import type { TEmploymentType, TLocationType, TSkillCategory, TSkillProficiency } from "../api/resume.types";
import { ZEmploymentTypeSchema, ZLocationTypeSchema, ZSkillCategorySchema, ZSkillProficiencySchema } from "../api/resume.types";

export function mapToEmploymentType(type: string | undefined): TEmploymentType {
    const validTypes = Object.values(ZEmploymentTypeSchema.enum);
    if (type && validTypes.includes(type as TEmploymentType)) {
        return type as TEmploymentType;
    }
    console.warn(`Invalid employment type: ${type}, defaulting to FULL_TIME`);
    return ZEmploymentTypeSchema.enum.FULL_TIME;
}

export function mapToLocationType(type: string | undefined): TLocationType {
    if (type && Object.values(ZLocationTypeSchema).includes(type as TLocationType)) {
        return type as TLocationType;
    }
    const upperType = type?.toUpperCase().replace(/-/g, "_");
    if (
        upperType &&
        Object.values(ZLocationTypeSchema).includes(upperType as TLocationType)
    ) {
        return upperType as TLocationType;
    }
    console.warn(`Invalid location type: ${type}, defaulting to ON_SITE`);
    return ZLocationTypeSchema.enum.ON_SITE;
}

export function mapToSkillCategory(
    category: string | undefined,
): TSkillCategory {
    if (
        category &&
        Object.values(ZSkillCategorySchema).includes(category as TSkillCategory)
    ) {
        return category as TSkillCategory;
    }
    const upperCategory = category?.toUpperCase();
    if (
        upperCategory &&
        Object.values(ZSkillCategorySchema).includes(upperCategory as TSkillCategory)
    ) {
        return upperCategory as TSkillCategory;
    }
    console.warn(`Invalid skill category: ${category}, defaulting to TECHNICAL`);
    return ZSkillCategorySchema.enum.TECHNICAL;
}

export function mapToSkillProficiency(
    proficiency: string | undefined,
): TSkillProficiency {
    if (
        proficiency &&
        Object.values(ZSkillProficiencySchema).includes(proficiency as TSkillProficiency)
    ) {
        return proficiency as TSkillProficiency;
    }
    const upperProficiency = proficiency?.toUpperCase();
    if (
        upperProficiency &&
        Object.values(ZSkillProficiencySchema).includes(
            upperProficiency as TSkillProficiency,
        )
    ) {
        return upperProficiency as TSkillProficiency;
    }
    console.warn(
        `Invalid skill proficiency: ${proficiency}, defaulting to INTERMEDIATE`,
    );
    return ZSkillProficiencySchema.enum.INTERMEDIATE;
}
