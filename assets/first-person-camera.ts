import { _decorator, Component, game, macro, math, systemEvent, SystemEvent, CameraComponent, renderer, Node, toRadian } from 'cc';
const { ccclass, property } = _decorator;
const { Vec2, Vec3, Quat } = math;

const v2_1 = new Vec2();
const v2_2 = new Vec2();
const v3_1 = new Vec3();
const v3_2 = new Vec3();
const v3_3 = new Vec3();

@ccclass
export class FirstPersonCamera extends Component {

    @property({ type: Node })
    public ground: Node = null;

    @property
    public moveSpeed = 1;

    @property
    public scrollSpeed = 1;

    @property
    public maxOrtheHeight = 94;

    @property
    public minOrtheHeight = 25;

    @property
    public panMaxPosition = new Vec3(40, 40, 0);

    @property
    public panMinPosition = new Vec3(-40, -40, 0);

    @property({ slide: true, range: [0.05, 0.5, 0.01] })
    public damp = 0.2;

    public _position = new Vec3();
    public _startTouchPoint = new Vec2();
    public _totalPanOffset = new Vec3();
    public _currentPanOffset = new Vec3();
    public _startPosition = null;

    _camera: CameraComponent;

    public onLoad () {
        const angle = 30; // the oblique angle
        this.node.eulerAngles = new Vec3(-angle, 45, 0);
        let halfSize = this.ground.scale.x * 0.5;
        // set camera's position to ground's corner
        this._startPosition = this.node.position = new Vec3(halfSize, Math.SQRT2 * halfSize * Math.tan(toRadian(angle)), halfSize);
        systemEvent.on(SystemEvent.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
        Vec3.copy(this._position, this.node.position);
        this._camera = this.node.getComponent(CameraComponent);
    }

    public onDestroy () {
        systemEvent.off(SystemEvent.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        systemEvent.off(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.off(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        systemEvent.off(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    public update (dt) {
        // position
        const ortheHeightScale = this.maxOrtheHeight / this._camera.orthoHeight;
        const panScale = new Vec3(ortheHeightScale, ortheHeightScale / Math.SQRT2, 1);
        Vec3.multiply(v3_2, this.panMinPosition, panScale);
        Vec3.multiply(v3_3, this.panMaxPosition, panScale);
        Vec3.add(v3_1, this._totalPanOffset, this._currentPanOffset);
        Vec3.transformQuat(v3_1, v3_1.clampf(v3_2, v3_3), this.node.rotation);
        Vec3.add(this._position, this._startPosition, v3_1);
        Vec3.lerp(v3_1, this.node.position, this._position, dt / this.damp);
        this.node.setPosition(v3_1);
    }

    public onMouseWheel (e) {
        const delta = -e.getScrollY() * this.scrollSpeed * 0.1; // delta is positive when scroll down
        if (this._camera.projection === renderer.CameraProjection.PERSPECTIVE) {
            Vec3.transformQuat(v3_1, Vec3.UNIT_Z, this.node.rotation);
            Vec3.scaleAndAdd(this._position, this.node.position, v3_1, delta);
        } else {
            this._camera.orthoHeight += delta * 0.1;
            this._camera.orthoHeight = math.clamp(this._camera.orthoHeight, this.minOrtheHeight, this.maxOrtheHeight);
        }
    }

    public onTouchStart (_e) {
        // if (game.canvas.requestPointerLock) { game.canvas.requestPointerLock(); }
        _e.getLocation(this._startTouchPoint);
        this._currentPanOffset.set(0, 0, 0);

    }

    public onTouchMove (e) {
        e.getStartLocation(v2_1);
        e.getLocation(v2_2);
        Vec2.subtract(v2_2, v2_2, this._startTouchPoint);
        const ortheHeightScale = this._camera.orthoHeight / this.maxOrtheHeight;
        this._currentPanOffset.x = -v2_2.x * this.moveSpeed * ortheHeightScale;
        this._currentPanOffset.y = -v2_2.y * this.moveSpeed * ortheHeightScale;
    }

    public onTouchEnd (e) {
        // if (document.exitPointerLock) { document.exitPointerLock(); }
        // e.getStartLocation(v2_1);
        this._totalPanOffset.add(this._currentPanOffset);
        this._currentPanOffset.set(0, 0, 0);
    }
}
