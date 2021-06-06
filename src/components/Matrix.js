import { makeStyles, createStyles } from "@material-ui/core";
import { useState } from "react";
import { Cell } from "./Cell";

const useStyles = makeStyles(() =>
  createStyles({
    matrixRow: {
      display: "flex",
      justifyContent: "center",
    },
    matrixCeil: {
      border: "white 1px solid",
      width: "50px",
      height: "50px",
    },
  })
);

export default function Matrix() {
  const classes = useStyles();

  const generateMatrix = () => {
    const randomNumber = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const shuffle = (array) => {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    };

    const listToMatrix = (list, elementsPerSubArray) => {
      let matrix = [],
        i,
        k;

      for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
          k++;
          matrix[k] = [];
        }

        matrix[k].push(list[i]);
      }

      return matrix;
    };

    const sum = 50;
    const max = 6;
    const min = 0;

    const defaultArray = [...Array(max + 1).keys()];
    const randomArray = [...Array(sum - max - 1).keys()].map(() =>
      randomNumber(min, max)
    );
    const wholeArray = defaultArray.concat(
      defaultArray,
      randomArray,
      randomArray
    );
    shuffle(wholeArray);
    const elementsPerSubArray = 10;
    const matrix = listToMatrix(wholeArray, elementsPerSubArray);
    return matrix;
  };
  const matrix = generateMatrix();

  const initialRow = [0].concat(new Array(10).fill(1)).concat([0]);
  let matrixList = new Array(12).fill(new Array(12).fill(0));
  matrixList.fill(initialRow, 1, 11);

  console.table(matrixList);
  const [matrixState, setMatrixState] = useState(matrixList);
  const [characterMatrix, setCharaterMatrix] = useState(matrix);

  let clickedCeils = [];
  const handleClickCell = (cIndex, rIndex) => () => {
    let newMatrix = matrixState.map((row) => [...row]);
    newMatrix[rIndex][cIndex] = 1;
    clickedCeils.push([cIndex + 1, rIndex + 1]);
    console.log(clickedCeils);
    if (clickedCeils.length === 2) {
      //find the empty connect line for the 2rd clicked cell
      let startPoint = 0;
      while (startPoint < clickedCeils[1][1]) {
        if (newMatrix) {
        }

        clickedCeils = [];
        console.log(clickedCeils);
      }
      // setMatrixState(newMatrix);
    }

    return (
      <div className="App">
        {characterMatrix.map((row, rowIndex) => (
          <div key={rowIndex} className={classes.matrixRow}>
            {row.map((value, columnIndex) => (
              <div key={columnIndex} className={classes.matrixCeil}>
                <Cell
                  characterIndex={value}
                  onClick={handleClickCell(columnIndex, rowIndex)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
}
