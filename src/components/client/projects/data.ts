import { Project, ActionItem } from "./types";


export const projects: Project[] = [
  {
    id: "cleo-astro",
    title: "Cleo Astro",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690916/cleoastro.jpg",
    progress: 95,
    status: "In Progress",
    startDate: "Aug 20, 2026",
    deadline: "Oct 10, 2026",
    description:
      "A modern astrology platform with an immersive visual experience, personalized readings and intuitive navigation.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "global-crossfire",
    title: "Global Crossfire Church",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689374/gcc.jpg",
    progress: 92,
    status: "In Progress",
    startDate: "Aug 15, 2024",
    deadline: "Oct 4, 2024",
    description:
      "A modern, responsive website for Global Crossfire Church with a clean, engaging design, CMS, event integration and a seamless media experience.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "alaso",
    title: "Alaso",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689294/alaso.jpg",
    progress: 96,
    status: "In Progress",
    startDate: "Jul 10, 2026",
    deadline: "Oct 12, 2026",
    description:
      "A modern digital experience designed around a clean and accessible product journey.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },

  // Completed projects
  {
    id: "rare-koncepts",
    title: "Rare Koncepts",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689463/rarekoncepts.jpg",
    progress: 100,
    status: "Completed",
    startDate: "May 5, 2026",
    deadline: "Jun 20, 2026",
    description:
      "A completed digital product experience.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "erekere",
    title: "Erékéré",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689460/erekere.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Mar 1, 2026",
    deadline: "Apr 12, 2026",
    description:
      "A completed web project.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "progrowing",
    title: "ProGrowing",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689807/progrowing.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Jan 10, 2026",
    deadline: "Feb 28, 2026",
    description:
      "A mentorship and developer growth platform.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "sparkling-white",
    title: "Sparkling White",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689795/sparklingwhite.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Dec 1, 2025",
    deadline: "Dec 20, 2025",
    description: "A completed web project.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "docmarine",
    title: "DocMarine HS",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689345/docmarinehs.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Oct 1, 2025",
    deadline: "Nov 15, 2025",
    description: "A completed web project.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "hustle-n-grind",
    title: "Hustle n Grind",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690054/hustlengrind.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Aug 1, 2025",
    deadline: "Sep 10, 2025",
    description: "A completed web project.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "idyll-consults",
    title: "Idyll Consults",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689292/idyllconsults.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Jun 1, 2025",
    deadline: "Jul 15, 2025",
    description: "A completed web project.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "slackbot",
    title: "Standup Bot for Slack",
    type: "Slack Integration",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690192/slackbot.jpg",
    progress: 100,
    status: "Completed",
    startDate: "Apr 1, 2025",
    deadline: "May 10, 2025",
    description:
      "A Slack integration for automated standup workflows.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
  {
    id: "openai-chatbot",
    title: "OpenAI Chatbot",
    type: "AI Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690144/chatbot.png",
    progress: 100,
    status: "Completed",
    startDate: "Feb 1, 2025",
    deadline: "Mar 10, 2025",
    description:
      "An AI-powered conversational application.",
    client: {
      fname: "Charles",
      lname: ".M",
      email: "charles@client-company.com",
    },
  },
];

export const actionItems: ActionItem[] = [
  {
    id: "approve-homepage",
    title: "Review homepage design",
    description: "Review the latest design version.",
  },
  {
    id: "official-email",
    title: "Provide official email",
    description: "Needed for contact forms and admin notifications.",
  },
];