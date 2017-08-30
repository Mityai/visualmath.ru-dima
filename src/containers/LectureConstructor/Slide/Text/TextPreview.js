import React, { PropTypes } from 'react'
import { KatexableComponent } from '../../../../utils/katexable'


export class TextPreview extends KatexableComponent {
  render() {
    let leftOffset = 0
    let topOffset = 0
    let leftBeforeDrag
    let topBeforeDrag
    let drag = false

    let { data } = this.props
  
    let images = data.data.getIn(['content', 'images'])
    let imagesLeft = data.data.getIn(['content', 'imagesLeft'])
    let imagesTop = data.data.getIn(['content', 'imagesTop'])
    let imagesScale = data.data.getIn(['content', 'imagesScale'])
    let editImages = data.setImages
  
    return (
      <div style={{flex: 1, minWidth: '50%', marginLeft: '5px'}}>
        <h2 className="katexable" style={{marginTop: 0}}>{data.name}</h2>
        <div className="katexable" dangerouslySetInnerHTML={{ __html: data.text }}></div>

        <div style={{position: 'relative'}}>
          {images && images.map((src, count, imgs)=>
            <div>
              <img src={src} key={count} style={
                {
                  // position: 'relative',
                  display: 'block',
                  // left: (imagesLeft.get(count) || 0) + 'px',
                  // top: (imagesTop.get(count) || 0) + 'px',
                  width: (imagesScale.get(count) || 400) + 'px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }
              } onMouseDown={
                  (event)=>{
                    leftOffset = event.clientX;
                    topOffset = event.clientY;
                    leftBeforeDrag = imagesLeft.get(count);
                    topBeforeDrag = imagesTop.get(count);
                    drag = true;
                  }
              } onMouseMove={
                  ({clientX, clientY, target})=>{
                    if (drag) {
                      let _images = imgs
                      let _imagesScale = imagesScale
                      let _imagesLeft = imagesLeft.set(count, leftBeforeDrag - leftOffset + clientX)
                      let _imagesTop = imagesTop.set(count, topBeforeDrag - topOffset + clientY)
                      target.style.left = imagesLeft.get(count) + 'px';
                      target.style.top = imagesTop.get(count) + 'px';

                      editImages({_images, _imagesLeft, _imagesTop, _imagesScale})
                    }
                  }
              } onMouseUp={
                () => {
                  if (drag) {
                    drag = false;
                    let _imagesLeft = imagesLeft
                    let _imagesTop = imagesTop
                    let _imagesScale = imagesScale
                    let _images = imgs
                    editImages({_images, _imagesLeft, _imagesTop, _imagesScale})
                  }
                }
              }
              />
              <br />
            </div>
          )}
        </div>
      </div>
    )
  }
}

TextPreview.propTypes = {
  data: PropTypes.object.isRequired,
}
