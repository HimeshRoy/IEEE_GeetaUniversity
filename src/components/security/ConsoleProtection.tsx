"use client";

import { useEffect } from "react";

export default function ConsoleProtection() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const styles = [
      "color: red",
      "font-size: 56px",
      "font-weight: 900",
      "line-height: 1.2",
    ].join(";");

    const messageStyles = [
      "color: #111827",
      "font-size: 16px",
      "font-weight: 600",
      "line-height: 1.6",
    ].join(";");

    const linkStyles = [
      "color: #00629B",
      "font-size: 15px",
      "font-weight: 700",
    ].join(";");

    console.clear();

    console.log("%cStop!", styles);

    console.log(
      "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable an IEEE GU feature or 'hack' someone's account, it is a scam and may give them access to your account.",
      messageStyles,
    );

    console.log(
      "%cDo not paste code into this console unless you understand exactly what it does.",
      messageStyles,
    );

    console.log(
      "%cIEEE Geeta University Student Branch",
      linkStyles,
    );
  }, []);

  return null;
}