import React from "react";
import { PredictionData } from "../types";
import Pocket from "./pocket";

import "./pocket-list.css";

import { AiOutlineEye } from 'react-icons/ai';
import { IconContext } from "react-icons";

export default class PocketList extends React.Component
  <{
    data: PredictionData,
    showAll: () => void,
    setPocketVisibility: (index: number, isVisible: boolean) => void,
    showOnlyPocket: (index: number) => void,
    focusPocket: (index: number) => void,
    highlightPocket: (index: number, isHighlighted: boolean) => void
  }, {}> {

  render() {
    if (this.props.data.pockets.length === 0) {
      return (
        <div className="pockets">
          <h3 className="text-center">No pockets found</h3>
        </div>
      );
    }
    return (
      <div className="pockets">
        <h3 className="text-center">
          Pockets &nbsp;
          <button
            type="button"
            className="btn btn-outline-secondary btn-show-pockets"
            title="Show all pockets."
            onClick={this.props.showAll}
          >
              <AiOutlineEye />
          </button>
        </h3>
        {this.props.data.pockets.map((item, index) => (
          <Pocket
            key={index}
            pocket={item}
            index={index}
            setPocketVisibility={this.props.setPocketVisibility}
            showOnlyPocket={this.props.showOnlyPocket}
            focusPocket={this.props.focusPocket}
            highlightPocket={this.props.highlightPocket}
          />
        ))}
      </div>);
  }
}