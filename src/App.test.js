import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';
test("renders learn react link", () => {
  const { getByText } = render(<App />);
  const heading = getByText(/React Firebase Login/i);
  expect(heading).toBeInTheDocument();
});
