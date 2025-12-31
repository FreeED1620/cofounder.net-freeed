"use client";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="w-full flex flex-col items-center justify-center px-6 py-10 text-center space-y-6">
        {/* Social Icons */}
        <div className="flex gap-6 justify-center">
          <a
            href="https://www.instagram.com/secyra.co"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
          </a>
          <a
            href="https://x.com/SecyraSecOps"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=secyrasecops@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
          </a>
        </div>

        {/* Feedback Message */}
        <p className="text-sm text-muted-foreground">
          Give us your feedback through one of our socials above
        </p>

        {/* Copyright */}
        <div className="text-xs text-muted-foreground">
          © 2025 Co-Connect · Designed by{" "}
          <a
            href="https://secyra.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            Secyra.co
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
