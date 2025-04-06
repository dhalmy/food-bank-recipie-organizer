import Head from "next/head";
import aboutTitle from "./about-title.png";

export default function AboutPage() {
  const containerStyle = {
    minHeight: "100vh",
    fontFamily: '"EB Garamond", serif',
    lineHeight: "1.6",
    color: "#333",
  };

  const contentStyle = {
    maxWidth: "800px",
    margin: "0 auto",
  };

  const titleImageStyle = {
    maxHeight: "150px",
    width: "auto",
    display: "block",
    margin: "-1rem auto 1.5rem auto", // reduces the top margin by -0.5rem
  };

  const paragraphStyle = {
    marginBottom: "1.5rem",
    fontSize: "1.25rem", // increased size
  };
  

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div style={containerStyle}>
        <div style={contentStyle}>
          <img src={aboutTitle.src} alt="About Us" style={titleImageStyle} />
          <p style={paragraphStyle}>
            We are a team of four dedicated students—two French and two American—who connected through the IIT swim team and a commitment to making a tangible impact on food insecurity. Our journeys have taken us from local community centers to international volunteer kitchens.
          </p>
          <p style={paragraphStyle}>
            One of our members gained firsthand insight into food insecurity while volunteering at Resto du Cœur in Lyon. Pierre’s time at an outreach program in Colombes opened his eyes to the transformative power of community support. David’s community service at a Chicago neighborhood center and Griffin’s hands-on experience at a local soup kitchen have both deepened our understanding of the challenges many face in accessing nutritious food.
          </p>
          <p style={paragraphStyle}>
            These varied experiences have inspired us to create practical solutions for food banks, ensuring that every meal package we help prepare offers more than just sustenance—it provides nourishment and dignity. With our diverse cultural insights and dedicated volunteer backgrounds, we believe we are uniquely equipped to tackle the complexities of food distribution and make a positive difference in communities worldwide.
          </p>
        </div>
      </div>
    </>
  );
}
