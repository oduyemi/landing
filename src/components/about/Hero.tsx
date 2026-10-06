"use client";
import React from "react";
import Image from "next/image";
import styles from "./Hero.module.css";
import {
  Linkedin,
  Mail,
  Github,
  Instagram,
  Globe,
  X as Twitter,
} from "lucide-react";

export const AboutHero: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1 className={styles.heading}>Meet Yẹmí</h1>

          <p className={`${styles.text} ${styles.subHeading}`}>
            I&apos;m a software developer who thinks semicolons 
            are optional — but writing clean, human-friendly 
            code isn&apos;t. I break down problems, not keyboards. 
            If it runs in the browser or backend, I&apos;ve probably 
            debugged it at 3am (with snacks and Stack Overflow 
            tabs open). <br /><br />
            Occasionally, I host virtual classes for programmers — mostly 
            to save others from the bugs I&apos;ve already 
            suffered through. I&apos;m also piecing together a 
            mentorship initiative. It&apos;s a slow build, but I&apos;m 
            not losing sleep over folks who aren&apos;t 
            serious — I&apos;d rather mentor than babysit.
          </p>

          <div className={styles.socials}>
            <a href="https://www.linkedin.com/in/opeyemi-oduyemi-bba776124/" target="_blank" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="mailto:hello@oduyemi.dev" aria-label="Email">
              <Mail size={20} />
            </a>
            <a href="https://x.com/oduyemi_" target="_blank" aria-label="Twitter / X">
              <Twitter size={20} />
            </a>
            <a href="https://github.com/oduyemi" target="_blank" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="https://instagram.com/hopyrane" target="_blank" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://oduyemi.hashnode.dev" target="_blank" aria-label="Blog">
              <Globe size={20} />
            </a>
          </div>
        </div>

        <div className={styles.right} style={{ marginTop: "50px"}}>
          <Image
            src="/images/dark.jpeg"
            alt="Yemi dark"
            className={styles.img1}
            width={120}
            height={120}
          />
          <Image
            src="/images/office.jpg"
            alt="Yemi headshot"
            className={styles.img2}
            width={120}
            height={120}
          />
          <Image
            src="/images/pink.jpg"
            alt="Profile image"
            className={styles.img3}
            width={120}
            height={120}
          />
          <Image
            src="/images/headshot.jpg"
            alt="Dark theme shot"
            className={styles.img4}
            width={120}
            height={120}
          />
          <iframe
            className={styles.video}
            src="https://www.youtube.com/embed/Ku-XgxbmB2o?si=o9GBeekJb1HIDvjI" 
            allowFullScreen
            title="About video"
          />
          <Image
            src="/images/new_dp.jpg"
            alt="Office"
            className={styles.img5}
            width={120}
            height={120}
          />
          <Image
            src="/images/yemi.png"
            alt="Workspace"
            className={styles.img6}
            width={120}
            height={120}
          />
        </div>
      </div>

    </section>
  );
};
