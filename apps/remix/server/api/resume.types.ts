import { z } from 'zod';

import { AwardSchema as ZAwardSchema } from '@project/prisma/generated/zod/modelSchema/AwardSchema';
import { CertificationSchema as ZCertificationSchema } from '@project/prisma/generated/zod/modelSchema/CertificationSchema';
import { ContactSchema as ZContactSchema } from '@project/prisma/generated/zod/modelSchema/ContactSchema';
import { ConversationSchema as ZConversationSchema } from '@project/prisma/generated/zod/modelSchema/ConversationSchema';
import { CoverLetterSchema as ZCoverLetterSchema } from '@project/prisma/generated/zod/modelSchema/CoverLetterSchema';
import { EducationSchema as ZEducationSchema } from '@project/prisma/generated/zod/modelSchema/EducationSchema';
import { ExperienceSchema as ZExperienceSchema } from '@project/prisma/generated/zod/modelSchema/ExperienceSchema';
import { MessagePartSchema as ZMessagePartSchema } from '@project/prisma/generated/zod/modelSchema/MessagePartSchema';
import { MessageSchema as ZMessageSchema } from '@project/prisma/generated/zod/modelSchema/MessageSchema';
import { ProjectSchema as ZProjectSchema } from '@project/prisma/generated/zod/modelSchema/ProjectSchema';
import { ResumeSchema as ZResumeSchema } from '@project/prisma/generated/zod/modelSchema/ResumeSchema';
import { SkillSchema as ZSkillSchema } from '@project/prisma/generated/zod/modelSchema/SkillSchema';
import { UserSchema as ZUserSchema } from '@project/prisma/generated/zod/modelSchema/UserSchema';
import { EmploymentTypeSchema as ZEmploymentTypeSchema } from '@project/prisma/generated/zod/inputTypeSchemas/EmploymentTypeSchema';
import { LocationTypeSchema as ZLocationTypeSchema } from '@project/prisma/generated/zod/inputTypeSchemas/LocationTypeSchema';
import { SkillCategorySchema as ZSkillCategorySchema } from '@project/prisma/generated/zod/inputTypeSchemas/SkillCategorySchema';
import { SkillProficiencySchema as ZSkillProficiencySchema } from '@project/prisma/generated/zod/inputTypeSchemas/SkillProficiencySchema';
import type { EmploymentTypeType as TEmploymentType } from '@project/prisma/generated/zod/inputTypeSchemas/EmploymentTypeSchema';
import type { LocationTypeType as TLocationType } from '@project/prisma/generated/zod/inputTypeSchemas/LocationTypeSchema';
import type { SkillCategoryType as TSkillCategory } from '@project/prisma/generated/zod/inputTypeSchemas/SkillCategorySchema';
import type { SkillProficiencyType as TSkillProficiency } from '@project/prisma/generated/zod/inputTypeSchemas/SkillProficiencySchema';

export type TAward = z.infer<typeof ZAwardSchema>;
export type TCertification = z.infer<typeof ZCertificationSchema>;
export type TContact = z.infer<typeof ZContactSchema>;
export type TConversation = z.infer<typeof ZConversationSchema>;
export type TCoverLetter = z.infer<typeof ZCoverLetterSchema>;
export type TEducation = z.infer<typeof ZEducationSchema>;
export type TExperience = z.infer<typeof ZExperienceSchema>;
export type TMessagePart = z.infer<typeof ZMessagePartSchema>;
export type TMessage = z.infer<typeof ZMessageSchema>;
export type TProject = z.infer<typeof ZProjectSchema>;
export type TResume = z.infer<typeof ZResumeSchema>;
export type TSkill = z.infer<typeof ZSkillSchema>;
export type TUser = z.infer<typeof ZUserSchema>;

export {
    ZAwardSchema,
    ZCertificationSchema,
    ZContactSchema,
    ZConversationSchema,
    ZCoverLetterSchema,
    ZEducationSchema,
    ZExperienceSchema,
    ZMessagePartSchema,
    ZMessageSchema,
    ZProjectSchema,
    ZResumeSchema,
    ZSkillSchema,
    ZUserSchema,
    ZEmploymentTypeSchema,
    ZLocationTypeSchema,
    ZSkillCategorySchema,
    ZSkillProficiencySchema,
}

export type {
    TEmploymentType,
    TLocationType,
    TSkillCategory,
    TSkillProficiency,
}