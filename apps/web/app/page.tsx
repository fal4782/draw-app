"use client"; // This is a client component as we are doing state management here
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <input
          className={styles.input}
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() => {
            router.push(`/room/${roomId}`);
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
