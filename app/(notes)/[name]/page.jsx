import dynamic from "next/dynamic";

const UserPage = dynamic(() => import("./client-page"), {
  ssr: false,
});


const Page = () => {
  return <UserPage />;
};

export default Page;
