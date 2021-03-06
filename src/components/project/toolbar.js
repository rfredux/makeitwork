'use strict'

const React = require('react')
const { Toolbar } = require('../toolbar')
const { IconPlus, IconList, IconGrid } = require('../icons')
const { Slider } = require('../slider')
const { SearchField } = require('../search')
const { IconButton } = require('../button')
const { bool, func, number } = React.PropTypes

const ProjectToolbar = ({
  isDisabled,
  zoom,
  maxZoom,
  onZoomChange,
  onItemCreate,
  ...props
}) => (
  <Toolbar {...props}>
    <div className="toolbar-left">
      <div className="tool-group">
        <Slider
          value={zoom}
          max={maxZoom}
          isDisabled={isDisabled}
          onChange={onZoomChange}
          minIcon={<IconList/>}
          maxIcon={<IconGrid/>}/>
      </div>
      <div className="tool-group">
        <IconButton icon={<IconPlus/>} onClick={onItemCreate}/>
      </div>
    </div>
    <div className="toolbar-right">
      <SearchField/>
    </div>
  </Toolbar>
)

ProjectToolbar.propTypes = {
  isDraggable: bool,
  isDisabled: bool,
  maxZoom: number.isRequired,
  zoom: number.isRequired,
  onDoubleClick: func,
  onItemCreate: func.isRequired,
  onZoomChange: func.isRequired
}

ProjectToolbar.defaultProps = {
  isDraggable: ARGS.frameless
}

module.exports = {
  ProjectToolbar
}
