import { useEffect, useState, forwardRef } from "react";
import { makeStyles, createStyles } from "@material-ui/core";
import { characterList } from "../characterList";

const useStyles = makeStyles(() =>
  createStyles({
    cell: {
      width: "50px",
      height: "50px",
      display: "inline",
      border: "1px white solid",
    },
  })
);

export const Cell = forwardRef((props, ref) => {
  const classes = useStyles();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const { characterIndex, onClick, clearSelection } = props;

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

  useEffect(() => {
    if (clearSelection) {
      setIsSelected(false);
      setIsHighlighted(false);
    }
  }, [clearSelection]);

  const characterImg =
    isHighlighted || isSelected
      ? characterList[characterIndex].highlightImg
      : characterList[characterIndex].blurImg;
  const characterName = characterList[characterIndex].name;

  return (
    <img
      ref={ref}
      src={characterImg}
      alt={characterName}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className={classes.cell}
    />
  );
});
