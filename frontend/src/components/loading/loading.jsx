import React from "react";
import Lottie from "lottie-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Lottie
        animationData={undefined} // não usamos import
        loop
        style={{ width: 200, height: 200 }}
        path="/animations/loading.json" // <-- caminho relativo da public
      />
    </div>
  );
}
