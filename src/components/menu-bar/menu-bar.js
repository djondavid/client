import React, {useState, useEffect} from "react";
import logo from "../../images/djs-works-logo.png";
import styles from "./menu-bar.module.scss";

const Navbar = (props) => {
  const [clickIndex, setClickIndex] = useState(null);
  useEffect(() => {
    setClickIndex(0);
  }, []);

  return (
    <header className={styles.menuBar}>
      <div className="container">
        <img src={logo} alt="DJS Works logo" className={styles.logo} />
        <nav>
          <ul>
            {props.menus.map((menu, index) => (
              <li key={menu.id}>
                <a 
                  href={menu.url} 
                  className={clickIndex === index ? styles.active : ""} 
                  onClick={(e) => {
                    e.preventDefault();
                    let roverStr = e.target.text;
                    roverStr = roverStr.toString();
                    //console.log(`menu ${index} clicked: ${roverStr}`);
                    setClickIndex(index);
                    props.handleClick(roverStr);
                  }}
                >
                  {menu.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
Navbar.defaultProps = {
  handleClick: function() {
    console.log("menu clicked");
  },
  data: [
    { id: 1, title: "Title", url: "/#" }
  ]
}
