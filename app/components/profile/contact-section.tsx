'use client'

import React from 'react';
import { Input } from '~/components/ui/input';

interface ContactSectionProps {
    register: any;
}

const ContactSection: React.FC<ContactSectionProps> = ({ register }) => {
    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="contact-email"
                    className="text-sm font-medium block"
                >
                    Email
                </label>
                <Input
                    id="contact-email"
                    type="email"
                    placeholder="Email address"
                    {...register("contact.email")}
                />
            </div>
            <div>
                <label
                    htmlFor="contact-phone"
                    className="text-sm font-medium block"
                >
                    Phone
                </label>
                <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Phone number"
                    {...register("contact.phone")}
                />
            </div>
            <div>
                <label
                    htmlFor="contact-city"
                    className="text-sm font-medium block"
                >
                    City
                </label>
                <Input
                    id="contact-city"
                    type="text"
                    placeholder="City"
                    {...register("contact.city")}
                />
            </div>
            <div>
                <label
                    htmlFor="contact-country"
                    className="text-sm font-medium block"
                >
                    Country
                </label>
                <Input
                    id="contact-country"
                    type="text"
                    placeholder="Country"
                    {...register("contact.country")}
                />
            </div>
        </div>
    );
};

export default ContactSection;