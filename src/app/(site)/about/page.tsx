import { AboutHero } from "@/components/about/Hero";
import { WhyWorkWithMe } from "@/components/about/WhyMe";
import { AboutMe } from "@/components/home/AboutMe";
import { ContactCTA } from "@/components/home/ContactCTA";
import { ProjectHub } from "@/components/project/ProjectHub";


export default function About() {
  return (
    <>
      <div style={{ marginTop: "20px"}}>
        <AboutHero />
      </div>
      <div>
        <ContactCTA />
      </div>
      <div>
        <AboutMe />
      </div>
      <div>
        <WhyWorkWithMe />
      </div>      
      <div>
        <ProjectHub />
      </div>
    </>

  );
}
