export function get_position_style(ctx, widget_width, y, node_height, rowHeight) {
    const MARGIN = 8;
  
  /**
   * Create a transform that deals with all the scrolling and zooming
   * This use of logarithms appears to be the most stable method to handle zooming
  */
    const elRect = ctx.canvas.getBoundingClientRect();
    const scaleFactor = ctx.getTransform().a;  // Scale: Zoomed in=[0.1, 1), Normal=1, Zoomed out=(1, 10]
    const scaledMargin = (1 + Math.log(MARGIN) / Math.log(2)) * (1 + Math.log10(MARGIN)) * (1 + (Math.log10(scaleFactor)));
    const transform = new DOMMatrix()
        .scaleSelf(elRect.width / ctx.canvas.width, elRect.height / ctx.canvas.height)
        .multiplySelf(ctx.getTransform())
        .translateSelf(scaledMargin, scaledMargin + y);
  
    return {
        transformOrigin: '0 0',
        transform: transform.toString(),
        left: `${scaledMargin}px`, 
        top: `${scaledMargin}px`,
        position: "absolute",
        maxWidth: `${widget_width - scaledMargin*4}px`,
        maxHeight: `${rowHeight}px`,    // we're assuming we have the whole height of the node
        width: `${widget_width - scaledMargin*4}px`,
        height: `${rowHeight}px`,
    }
  }