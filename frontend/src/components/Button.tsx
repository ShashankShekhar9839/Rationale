import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({ children, className = "", ...rest }: Props) {
  return (
    <button className={`button ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
