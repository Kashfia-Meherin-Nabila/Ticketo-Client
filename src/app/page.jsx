import Hero from "@/components/Hero";
import Statistics from "@/components/Statistics";
import Testimonials from "@/components/Testimonials";
import WhyChoose from "@/components/WhyChoose";

export default async function HomePage() {
  const stats={
  totalEvents: 30 ,
  totalAttendees: 4000,
  totalOrgs:10
}

  return (
    <div>
      <Hero/>
      <WhyChoose/>
      <Statistics stats={stats}/>
      <Testimonials/>
    </div>
  );
}

