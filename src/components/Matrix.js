import { makeStyles, createStyles } from "@material-ui/core";
import { useState, useEffect, useCallback } from "react";
import { Cell } from "./Cell";
import { Line } from "react-lineto";
import uuid from "react-uuid";

const useStyles = makeStyles(() =>
  createStyles({
    matrix: {
      display: "relative",
    },
    row: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cell: {
      width: "50px",
      height: "50px",
      display: "inline",
      border: "1px white solid",
    },
    blankCell: {
      width: "50px",
      height: "50px",
      display: "inline-block",
      border: "1px white solid",
      zIndex: -1,
    },
    "@keyframes fadeOut": {
      "0%": {
        opacity: 1,
      },
      "100%": {
        opacity: 0,
      },
    },
    line: {
      opacity: 0,
      animation: "$fadeOut 1s ease-in-out",
    },
  })
);

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

const generateMatrix = (sum, elementsPerSubArray) => {
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
  return listToMatrix(wholeArray, elementsPerSubArray);
};

/**
 * Get a new matrix which guard the original one with one layer of 0
 * @param {*} m the original matrix
 */
const acquireGuardMatrix = (m) => {
  const core = m.map((x) => [-1, ...x, -1]);
  const cap = new Array(m[0].length + 2).fill(-1);
  return [cap, ...core, cap];
};

/**
 * Get a list of numbers which is between && equals to two numbers
 * @param {*} s the start number
 * @param {*} e the end number
 */
const acquireNumbersBetween = (s, e) => {
  if (s < e) {
    return [...Array(e - s + 1).keys()].map((x) => x + s);
  } else if (s > e) {
    return [...Array(s - e + 1).keys()].map((x) => x + e);
  } else {
    return [s, e];
  }
};

/**
 * Get a list of points(ri, ci) which is between && on two points in grid in one line
 * @param {*} sr row index of start point
 * @param {*} sc column index of start point
 * @param {*} er row index of end
 * @param {*} ec column index of end point
 */
const acquirePointsBetween = (l) => {
  const sr = l[0];
  const sc = l[1];
  const er = l[2];
  const ec = l[3];
  if (sr === er && sc === ec) {
    return [];
  } else if (sr === er) {
    return acquireNumbersBetween(sc, ec).map((c) => [sr, c]);
  } else if (sc === ec) {
    return acquireNumbersBetween(sr, er).map((r) => [r, sc]);
  } else {
    return [];
  }
};

/**
 * Find legal points sets
 * @param {*} m matrix which removed both start points and end points (set to 0)
 * @param {*} paths points set list
 */
const acquirePointsPathList = (cleanedM, paths) => {
  const pathsPointList = paths.map((path) => [
    ...acquirePointsBetween(path[0]),
    ...(path[1] ? acquirePointsBetween(path[1]) : []),
    ...(path[2] ? acquirePointsBetween(path[2]) : []),
  ]);
  let result = [];
  pathsPointList.forEach((path) => {
    path.every((x) => cleanedM[x[0]][x[1]] === -1) && result.push(path);
  });
  return result;
};

/**
 * Get the matrix that removed both start points and end points (set to 0)
 * @param {*} pa start point
 * @param {*} pb end point
 * @param {*} m original guarded matrix
 */
const acquireCleanedM = (pa, pb, m) => {
  let result = JSON.parse(JSON.stringify(m));
  result[pa.ri][pa.ci] = -1;
  result[pb.ri][pb.ci] = -1;
  return result;
};

/**
 * Main method to get tha avaliable pat
 * @param {*} pa start point
 * @param {*} pb end point
 * @param {*} cleanedM cleaned guarded matrix
 */
const calculatePath = (pa, pb, cleanedM) => {
  const directPath = [[pa.ri, pa.ci, pb.ri, pb.ci]];
  const riPathUnit = (rIndex) => [
    [pa.ri, pa.ci, rIndex, pa.ci],
    [rIndex, pa.ci, rIndex, pb.ci],
    [rIndex, pb.ci, pb.ri, pb.ci],
  ];
  const ciPathUnit = (cIndex) => [
    [pa.ri, pa.ci, pa.ri, cIndex],
    [pa.ri, cIndex, pb.ri, cIndex],
    [pb.ri, cIndex, pb.ri, pb.ci],
  ];
  const riKeys = [...Array(cleanedM.length).keys()];
  const ciKeys = [...Array(cleanedM[0].length).keys()];
  let totalPaths = [];
  if (pa.ri === pb.ri) {
    const paths = riKeys.filter((x) => x !== pa.ri).map((r) => riPathUnit(r));
    totalPaths = [...paths, directPath];
  } else if (pa.ci === pb.ci) {
    const paths = ciKeys.filter((x) => x !== pa.ci).map((c) => ciPathUnit(c));
    totalPaths = [...paths, directPath];
  } else {
    const pathsR = riKeys.map((r) => riPathUnit(r));
    const pathsC = ciKeys.map((c) => ciPathUnit(c));
    totalPaths = [...pathsR, ...pathsC];
  }
  return acquirePointsPathList(cleanedM, totalPaths);
};

/**
 * Remove dunplicated points in points list
 * @param {*} list points list
 */
const removeDuplicatedPoints = (list) => {
  const r = list.map((x) => JSON.stringify(x));
  return r.filter((x, idx) => idx === r.indexOf(x)).map((x) => JSON.parse(x));
};

/**
 * Get the shortest path from the path list
 * @param {*} pathList points list's list
 */
const findTheMinPath = (pathList) => {
  let index = 0;
  if (pathList.length === 0) return [];
  const cleanList = pathList.map((x) => removeDuplicatedPoints(x));
  cleanList.forEach((path, i) => {
    if (path.length < cleanList[index].length) {
      index = i;
    }
  });
  return pathList[index];
};

/**
 * Get the duplicated points from the path
 * @param {*} path points the shortest path
 */
const findPathPoints = (path) => {
  return path
    .map((x) => JSON.stringify(x))
    .filter((x, idx, self) => idx !== self.indexOf(x))
    .map((x) => JSON.parse(x));
};

export default function Matrix() {
  const classes = useStyles();

  const initMatrix = generateMatrix(50, 10);

  const initGuardMatrix = acquireGuardMatrix(initMatrix);
  const [guardMatrix, setGuardMatrix] = useState(initGuardMatrix);

  const [pointA, setPointA] = useState(undefined);
  const [pointB, setPointB] = useState(undefined);
  const [initPoint, setInitPoint] = useState(undefined);

  const [pathPoints, setPathPoints] = useState(undefined);

  useEffect(() => {
    if (pointA && pointB) {
      if (pointA.value === pointB.value) {
        const cleanedM = acquireCleanedM(pointA, pointB, guardMatrix);
        const r = calculatePath(pointA, pointB, cleanedM);

        const rr = findTheMinPath(r);

        if (rr.length !== 0) {
          setGuardMatrix(cleanedM);
          setPathPoints({
            id: uuid(),
            value: [
              [pointA.ri, pointA.ci],
              ...findPathPoints(rr),
              [pointB.ri, pointB.ci],
            ],
          });
        }
      }

      setPointA(undefined);
      setPointB(undefined);
    }
  }, [pointA, pointB, guardMatrix, pathPoints]);

  const onCellClicked = (ri, ci, x) => () => {
    if (x !== -1) {
      if (pointA !== undefined) {
        if (ri !== pointA.ri || ci !== pointA.ci) {
          setPointB({ ri: ri, ci: ci, value: x });
        } else {
          setPointA(undefined);
        }
      } else {
        setPointA({ ri: ri, ci: ci, value: x });
      }
    }
  };

  const initPointRef = useCallback((node) => {
    if (node !== null) {
      const top =
        (node.getBoundingClientRect().top +
          node.getBoundingClientRect().bottom) /
        2;
      const left =
        (node.getBoundingClientRect().left +
          node.getBoundingClientRect().right) /
        2;
      setInitPoint([left, top]);
    }
  }, []);

  const clearSelection =
    pointA !== undefined &&
    pointB !== undefined &&
    pointA.value !== pointB.value;

  const lines =
    pathPoints !== undefined &&
    pathPoints.value &&
    pathPoints.value.map((_, index) => {
      if (index < pathPoints.value.length - 1) {
        return (
          <Line
            className={classes.line}
            borderColor="red"
            borderStyle="dotted"
            borderWidth={5}
            key={pathPoints.id + index}
            x0={initPoint[0] + 52 * pathPoints.value[index][1]}
            y0={initPoint[1] + 52 * pathPoints.value[index][0]}
            x1={initPoint[0] + 52 * pathPoints.value[index + 1][1]}
            y1={initPoint[1] + 52 * pathPoints.value[index + 1][0]}
          />
        );
      } else {
        return <div key={index} />;
      }
    });

  return (
    <div>
      <div className={classes.matrix}>
        {guardMatrix.map((rows, ri) => (
          <div className={classes.row} key={ri}>
            {rows.map((x, ci) =>
              x > -1 ? (
                <Cell
                  key={ci}
                  className={classes.cell}
                  characterIndex={x}
                  clearSelection={clearSelection}
                  onClick={onCellClicked(ri, ci, x)}
                />
              ) : (
                <div
                  key={ci}
                  className={classes.blankCell}
                  {...(ri === 0 && ci === 0 ? { ref: initPointRef } : {})}
                ></div>
              )
            )}
          </div>
        ))}
        {lines}
      </div>
    </div>
  );
}
