import Image from "next/image";
import AuthButton from "@/components/login-button";
import UserInfoCard from "@/components/user-info";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-xl">
        <div className="relative w-full">
          <Image
            className=" w-auto"
            src="/wave.svg"
            alt="Wave logo"
            width={320}
            height={80}
            priority
          />
          <Image
            className="dark:invert absolute top-0 left-1/2 -translate-x-1/2"
            src={`/${
              process.env.SERVICE_NAME === "play3"
                ? "play3.png"
                : "supervlabs.svg"
            }`}
            alt="Logo"
            width={320}
            height={80}
            style={{ height: "auto" }}
            priority
          />
        </div>

        <UserInfoCard />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li>Login to {`${process.env.NEXT_PUBLIC_FRONTEND_URL}`}</li>
          <li>
            Link your accounts with scenario v1:{" "}
            <Link href={"/link/create-link"} className="underline italic">
              /link/create-link
            </Link>
          </li>
          <li>
            Link your accounts with scenario v2:{" "}
            <Link href={"/user_link"} className="underline italic">
              /user_link
            </Link>
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <AuthButton />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
