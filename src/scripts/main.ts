class DragWithAccelerator {
  dragged: boolean = false
  draggable: boolean = false
  target: any
  startX: number = 0
  currentPositionX: number = 0
  previousPositionX: number = 0
  velocityX: number = 0
  minus: number = 0.9
  redundantCall: boolean = true
  acceleration: number = 0.1
  pendingX: number = 0
  animationFrame: number = 0
  updateFrame: number = 0
  timestamp: number = 0
  now: number = 0
  collectTime: boolean = true

  interval: NodeJS.Timer
  forCheckX: number = 0

  speedList: {
    direction: "left" | "right" | "center"
    timestamp: number
    speed: number
  }[]

  movedX: number = 0

  maxFinalMoveX: number = 500

  movementX: number = 0
  lastVelocityX: number = 0
  constructor(target: any) {
    this.target = target
  }
  capSpeed = (value: number) => {
    let res = 0
    if (Math.abs(value) > this.maxFinalMoveX) {
      res = this.maxFinalMoveX
      res *= value < 0 ? -1 : 1
      return res
    }
    return value
  }
  velocityAction = () => {
    this.currentPositionX =
      this.previousPositionX + this.lastVelocityX - this.velocityX
    this.target.style.transform = `translateX(${this.currentPositionX + "px"})`
    this.velocityX = this.velocityX * 0.92
    this.velocityX = Math.round(this.velocityX * 10) / 10
    this.velocityX = this.capSpeed(this.velocityX)
    if (Math.floor(Math.abs(this.velocityX)) !== 0) {
      this.animationFrame = requestAnimationFrame(this.velocityAction)
    } else {
      cancelAnimationFrame(this.animationFrame)
    }
  }
  update = (timer: number) => {
    this.redundantCall = true
    this.pendingX =
      this.pendingX +
      (this.currentPositionX - this.pendingX) * this.acceleration

    if (Math.abs(this.currentPositionX - this.pendingX) < 1) {
      cancelAnimationFrame(this.updateFrame)
    } else {
      this.target.style.transform = `translateX(${this.pendingX + "px"})`
      this.updateFrame = requestAnimationFrame(this.update)
    }
  }
  handleDown = (e: MouseEvent & TouchEvent) => {
    cancelAnimationFrame(this.animationFrame)
    this.movementX = 0
    this.draggable = true
    this.dragged = false
    this.startX = e.pageX ?? e.touches[0].pageX
    this.speedList = []
    this.redundantCall = true
    this.velocityX = 0
    this.previousPositionX = this.currentPositionX
    this.pendingX = this.previousPositionX
  }
  handleMove = (e: MouseEvent & TouchEvent) => {
    if (this.draggable) {
      this.dragged = true

      const oldX = this.currentPositionX
      const pageX = e.pageX ?? e.touches[0].pageX

      this.now = Date.now()
      const dragX = pageX - this.forCheckX
      const direction = dragX === 0 ? "center" : dragX < 0 ? "left" : "right"

      const dragTime = this.now - this.timestamp
      const speed = dragX / dragTime

      this.movedX = pageX - this.startX
      this.currentPositionX = this.movedX + this.previousPositionX
      this.forCheckX = pageX

      this.timestamp = this.now
      this.movementX = e.movementX ?? this.currentPositionX - oldX
      this.speedList.push({ direction, speed, timestamp: this.now })

      if (this.redundantCall) {
        this.redundantCall = false

        requestAnimationFrame(this.update)
      }
    }
  }
  handleUp = (e: MouseEvent) => {
    cancelAnimationFrame(this.updateFrame)
    this.draggable = false
    this.previousPositionX = this.currentPositionX
    let average = 0
    let lastDirection = "center"
    const collectFrom = new Date(Date.now() - 500)
    if (this.speedList.length > 0) {
      lastDirection = this.speedList[this.speedList.length - 1].direction
      const filteredSpeed = this.speedList
        .filter((item) => collectFrom < new Date(item.timestamp))
        .filter((item) => item.direction === lastDirection)
      average = Number(
        (
          filteredSpeed.reduce((total, curr) => {
            return (total += curr.speed)
          }, 0) / filteredSpeed.length
        ).toFixed(2)
      )
    }

    this.velocityX = (average ?? 1) * this.movementX
    this.velocityX =
      this.capSpeed(this.velocityX) * (lastDirection === "left" ? -1 : 1)
    this.lastVelocityX = this.velocityX
    this.velocityAction()
    if (!this.dragged) {
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const wrap = document.querySelector("#animate")
  const arr = Array.from(Array(12).keys())
  function createDiv() {
    for (let i = 0; i < arr.length; i++) {
      const childDiv = document.createElement("div")
      childDiv.innerHTML = `${arr[i]}`
      childDiv.classList.add(`child-${arr[i]}`)
      wrap.appendChild(childDiv)
    }
  }
  createDiv()
  const { handleDown, handleMove, handleUp } = new DragWithAccelerator(wrap)
  window.addEventListener("mousedown", handleDown)
  window.addEventListener("mousemove", handleMove)
  window.addEventListener("mouseup", handleUp)
  window.addEventListener("touchstart", handleDown)
  window.addEventListener("touchmove", handleMove)
  window.addEventListener("touchend", handleUp)
})
