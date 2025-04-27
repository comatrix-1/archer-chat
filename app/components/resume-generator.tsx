import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ProfileComponent from './profile'; // Use the correct import path for ProfileComponent

export interface ResumeItem {
  id: string;
  title: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
  Conversation?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    profileId?: string;
    userId?: string;
  };
}

function safeNavigateToDetail(id: string) {
  if (typeof window !== 'undefined') {
    window.location.href = `/resume-generator-detail?id=${id}`;
  }
}

export default function ResumeGenerator() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [adding, setAdding] = useState(false);
  const form = useForm<{ title: string; jobDescription: string }>({
    defaultValues: {
      title: 'Product Expert - Video Cloud at ByteDance',
      jobDescription: `Responsibilities
Team Introduction
Multimedia middle platform (Video Cloud) is one of the world's leading video platforms, providing media storage, transcoding and streaming services. We are committed to building the next generation video processing platform and the largest live broadcast network to provide an excellent experience for billions of users around the world. The role of the Solutions Expert requires in-depth understanding of video cloud business architecture, helping internal/external business parties to deepen product awareness, promote product optimization, and output the best solution in combination with product capabilities.

As a Video Cloud Product Expert, you will be responsible for

1. Planning and implementation of Video Cloud's overseas products and solutions to promote the achievement of business goals, with basic products involving Live/VOD/RTC, etc.
2. Analyze and insight into international market/regional opportunities, based on markets/competitors/clients, analyze cutting-edge trends in the video field, and complete product strategy formulation;
3. Lead the product and solution design, coordinate all resources as the product owner, promote the Product R&D process, and ensure high-quality implementation and delivery;
4. Make a clear portrait of the market/clients, combine with the product plan, provide sales kits, support the front-end team to do a good job in product GTM, and promote revenue growth.

Qualifications
Minimum Qualifications:
Proven years of experience in Cloud Services related products, familiar with Video Cloud PaaS/SaaS and other related products
Understand Video Cloud product services and market competition landscape, possess product comprehension, design and monetization capabilities; be sensitive to industry changes and passionate about researching cutting-edge technologies;
Strong initiative and product ownership, strong teamwork and communication skills, active thinking, active learning, able to work under pressure;

Preferred Qualifications:
Experience with international market product and management experience are preferred.

About Us
Founded in 2012, ByteDance's mission is to inspire creativity and enrich life. With a suite of more than a dozen products, including TikTok, Lemon8, CapCut and Pico as well as platforms specific to the China market, including Toutiao, Douyin, and Xigua, ByteDance has made it easier and more fun for people to connect with, consume, and create content.


Why Join ByteDance
Inspiring creativity is at the core of ByteDance's mission. Our innovative products are built to help people authentically express themselves, discover and connect – and our global, diverse teams make that possible. Together, we create value for our communities, inspire creativity and enrich life - a mission we work towards every day.
As ByteDancers, we strive to do great things with great people. We lead with curiosity, humility, and a desire to make impact in a rapidly growing tech company. By constantly iterating and fostering an "Always Day 1" mindset, we achieve meaningful breakthroughs for ourselves, our Company, and our users. When we create and grow together, the possibilities are limitless. Join us.
Diversity & Inclusion
ByteDance is committed to creating an inclusive space where employees are valued for their skills, experiences, and unique perspectives. Our platform connects people from across the globe and so does our workplace. At ByteDance, our mission is to inspire creativity and enrich life. To achieve that goal, we are committed to celebrating our diverse voices and to creating an environment that reflects the many communities we reach. We are passionate about this and hope you are too.`
    }
  });

  // Fetch resumes from API on mount (if not adding)
  useEffect(() => {
    if (!adding) {
      fetchWithAuth('/api/resume/list').then(res => {
        if (res.data && res.data.profiles) {
          setResumes(res.data.profiles);
        }
      });
    }
  }, [adding]);

  const onSubmit = async (data: { title: string; jobDescription: string }) => {
    const res = await fetchWithAuth('/api/resume/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.data;
    setAdding(false);
    // Optionally, reload list after adding
  };

  if (adding) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Resume Generator</h1>
          <Button onClick={() => setAdding(false)}>Back to List</Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded shadow mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title (e.g. Software Engineer at Meta)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the job description here" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>Generate</Button>
              <Button type="button" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Resume Generator</h1>
        <Button onClick={() => setAdding(true)}>Add New</Button>
      </div>
      <div className="space-y-4">
        {resumes.length === 0 && <div className="text-gray-500">No resumes generated yet.</div>}
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => safeNavigateToDetail(resume.id)}
          >
            <div className="font-semibold text-lg mb-1">
              {resume.Conversation?.title || 'Untitled Conversation'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
