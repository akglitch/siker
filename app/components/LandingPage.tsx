"use client";
import { Button } from "../ui/button";
import { buttonVariants } from "../ui/button";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="min-h-screen mx-auto grid lg:grid-cols-2 place-items-center py-20 gap-10">
      {/* Main Text Section */}
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold leading-tight">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              Effortless
            </span>{" "}
            attendance tracking
          </h1>{" "}
          for{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              modern organizations
            </span>
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Streamline your workflow with real-time attendance tracking and
          resource management tailored for your organization's needs.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <a
            rel="noreferrer noopener"
            href="/signUp"
            target="_blank"
            className={`w-full sm:w-auto ${buttonVariants({
              variant: "outline",
            })} px-4 py-2`}
          >
            Get Started
          </a>

          <a
            rel="noreferrer noopener"
            href="/login"
            target="_blank"
            className={`w-full sm:w-auto ${buttonVariants({
              variant: "outline",
            })} px-4 py-2`}
          >
            Login
          </a>
        </div>
      </div>

      {/* Illustration Section */}
      <div className="z-10">
        <Image
          src="/undraw_programming_re_kg9v.svg"
          alt="Teamwork illustration"
          width={600}
          height={600}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* Shadow Effect */}
      <div className="shadow"></div>
    </section>
  );
};
