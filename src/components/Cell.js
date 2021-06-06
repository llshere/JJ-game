import { useState } from "react";
import { makeStyles, createStyles } from "@material-ui/core";
import { characterList } from "../characterList";

const useStyles = makeStyles(() =>
  createStyles({
    img: {
      width: "50px",
      height: "50px",
    },
  })
);

export const Cell = (props) => {
  const classes = useStyles();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const { characterIndex, onClick } = props;

  const handleClick = () => {
    setIsSelected(!isSelected);
    setIsHighlighted(!isSelected);
    onClick();
  };
  const handleHover = () => {
    setIsHighlighted(true);
  };
  const handleLeave = () => {
    setIsHighlighted(false);
  };

  const characterImg =
    isHighlighted || isSelected
      ? characterList[characterIndex].highlightImg
      : characterList[characterIndex].blurImg;
  const characterName = characterList[characterIndex].name;

  return (
    <img
      src={characterImg}
      alt={characterName}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className={classes.img}
    />
  );
};
