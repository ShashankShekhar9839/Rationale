import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({ children, ...rest }: Props) {
  return (
    <button className="button" {...rest}>
      {children}
    </button>
  );
}
