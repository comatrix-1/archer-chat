import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@project/remix/app/components/ui/card"

interface SectionCardProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export const SectionCard = ({ children, title, description }: SectionCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}