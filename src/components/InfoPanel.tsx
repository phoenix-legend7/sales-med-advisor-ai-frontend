import clsx from "clsx";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Heart, Brain, Activity } from "lucide-react";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  content,
  className,
}) => (
  <Card
    className={clsx(
      "h-full transition-transform duration-300 hover:scale-105",
      className
    )}
  >
    <CardHeader className="pb-2 bg-gradient-to-r from-white to-medical-light rounded-t-lg">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-sm">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground pt-3">
      {content}
    </CardContent>
  </Card>
);

const InfoPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard
        icon={<Stethoscope className="h-5 w-5 text-medical-primary" />}
        title="Medical Expertise"
        content="Access professional medical knowledge for your healthcare questions and concerns."
        className="shadow-md"
      />
      <InfoCard
        icon={<Heart className="h-5 w-5 text-medical-primary" />}
        title="Health Guidance"
        content="Receive guidance on common health issues and preventive care measures."
        className="shadow-md"
      />
      <InfoCard
        icon={<Brain className="h-5 w-5 text-medical-primary" />}
        title="AI-Powered"
        content="Utilizing advanced AI technology to provide accurate and helpful responses."
        className="shadow-md"
      />
      <InfoCard
        icon={<Activity className="h-5 w-5 text-medical-primary" />}
        title="Voice Interaction"
        content="Simply speak your questions and get voice responses for a natural experience."
        className="shadow-md"
      />
    </div>
  );
};

export default InfoPanel;
