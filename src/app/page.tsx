"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  const ss = useRef<HTMLInputElement>();
  useEffect(() => {
    console.log(ss.current);
  }, []);

  const handleSumb = async () => {
    const formData = new FormData();
    formData.append("image", ss.current.value);
    console.log(formData.get("image"));
    await axios
      .post("/api/media", formData, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxfSwiaWF0IjoxNjkxNjQ1Nzk3LCJleHAiOjE2OTQyMzc3OTd9.5U8WbaAccOrOcQYi54FVWeOVzC4P2gX8LQx2WjFC6Zj_KBPunfFmHjFIHaE7UPPWipF9LvByRoRTe_EIeouK9Q",
        },
      })
      .catch((err) => console.log(err));
    // const aa = await fetch("/api/media", {
    //   method: "POST",
    //   body: formData,
    //   // headers: {
    //   //   authorization:
    //   //     "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxfSwiaWF0IjoxNjkxNjQ1Nzk3LCJleHAiOjE2OTQyMzc3OTd9.5U8WbaAccOrOcQYi54FVWeOVzC4P2gX8LQx2WjFC6Zj_KBPunfFmHjFIHaE7UPPWipF9LvByRoRTe_EIeouK9Q",
    //   //   "content-type": "multipart/form-data",
    //   // },
    //   headers: {
    //     "content-type": "multipart/form-data",
    //   },
    // });

    // console.log(await aa.json());
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input
        type="file"
        ref={ss}
        onChange={(e) => console.log(e.target.value)}
      />
      <button onClick={handleSumb}>SSSSSSSSSSSSS</button>
    </main>
  );
}
