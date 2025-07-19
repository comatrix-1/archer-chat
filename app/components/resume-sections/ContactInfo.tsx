import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '../../states/resumeStore';

const contactInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  address: z.string().optional(),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

export function ContactInfo() {
  const contactInfo = useResumeStore((state) => state.resume.contactInfo);
  const updateContactInfo = useResumeStore((state) => state.updateContactInfo);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: contactInfo,
  });

  const onSubmit = (data: ContactInfoFormValues) => {
    updateContactInfo(data);
    console.log("Contact Info Updated:", data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="contact-info-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" {...register('linkedin')} />
            {errors.linkedin && <p className="text-red-500 text-sm">{errors.linkedin.message}</p>}
          </div>
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" {...register('github')} />
            {errors.github && <p className="text-red-500 text-sm">{errors.github.message}</p>}
          </div>
          <div>
            <Label htmlFor="portfolio">Portfolio</Label>
            <Input id="portfolio" {...register('portfolio')} />
            {errors.portfolio && <p className="text-red-500 text-sm">{errors.portfolio.message}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="contact-info-form">Save Contact Info</Button>
      </CardFooter>
    </Card>
  );
}