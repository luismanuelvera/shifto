import { useState } from "react";
import "./App.css";
import "./app/Hero";
import Hero from "./app/Hero";
import Footer from "./app/Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Hero></Hero>
      {/* <Footer></Footer> */}
    </div>
  );
}

export default App;
