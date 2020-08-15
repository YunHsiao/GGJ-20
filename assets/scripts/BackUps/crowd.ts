import { _decorator, Component, Node, Prefab, instantiate, randomRange, Vec3, Quat, random, SliderComponent, SkeletalAnimationComponent } from 'cc';
const { ccclass, property } = _decorator;

const v3_1 = new Vec3();
const v3_2 = new Vec3();
const v3_3 = new Vec3();
const qt_1 = new Quat();

const truncateV3 = (v: Vec3, max: number) => {
    const l = Vec3.len(v);
    if (l > max) Vec3.multiplyScalar(v, v, max / l);
};
const apply = (acc: Vec3, vel: Vec3, factor: Vec3, intensity: number, max: number) => {
    Vec3.multiplyScalar(v3_1, factor, max / Vec3.len(factor));
    truncateV3(Vec3.subtract(v3_1, v3_1, vel), intensity);
    Vec3.add(acc, acc, v3_1);
};

class Boid {
    acceleration = new Vec3();
    velocity = new Vec3(randomRange(-1, 1), 0, randomRange(-1, 1)).normalize();
    position = new Vec3(randomRange(-1, 1), 0, randomRange(-1, 1)).normalize();
    rotation = new Quat();
    idle = false;
}

class Flock {
    flockmateRadius    = 30;   // [0, 500]
    separationDistance = 10;   // [0, 100]
    maxVelocity        = 0.2;  // [0, 5]
    alignmentForce     = 0.03; // [0, 0.25]
    cohesionForce      = 0.03; // [0, 0.25]
    separationForce    = 0.03; // [0, 0.25]
    guideForce         = 0.09; // [0, 0.25]

    boids: Boid[]      = [];

    boundingRadius     = 100;
    alignment          = new Vec3();
    cohesion           = new Vec3();
    separation         = new Vec3();
    guide              = new Vec3();
    alignmentActive    = false;
    cohesionActive     = false;
    separationActive   = false;
    guideActive        = false;

    addBoid () {
        const boid = new Boid();
        Vec3.multiplyScalar(boid.position, boid.position, randomRange(1, this.boundingRadius));
        this.boids.push(boid);
    }

    update () {
        const { boids, flockmateRadius, separationDistance, maxVelocity, boundingRadius,
            alignmentForce, cohesionForce, separationForce, guideForce, alignment, cohesion, separation, guide,
        } = this;

        let distance = 0;

        for (let i = 0; i < boids.length; i++) {
            const b1 = boids[i];
            if (b1.idle) continue;

            Vec3.set(alignment, 0, 0, 0);
            Vec3.set(cohesion, 0, 0, 0);
            Vec3.set(separation, 0, 0, 0);
            Vec3.set(b1.acceleration, 0, 0, 0);

            for (let j = 0; j < boids.length; j++) {
                const b2 = boids[j];
                if (b1 === b2) continue;

                Vec3.subtract(v3_1, b2.position, b1.position);
                distance = Math.max(0.1, Vec3.len(v3_1));

                if (distance < separationDistance) {
                    Vec3.multiplyScalar(v3_3, v3_1, -1 / distance);
                    Vec3.add(separation, separation, v3_3);
                    this.separationActive = true;
                }

                if (distance < flockmateRadius) {
                    Vec3.add(cohesion, cohesion, v3_1);
                    this.cohesionActive = true;
                    Vec3.add(alignment, alignment, b2.idle ? Vec3.ZERO : b2.velocity);
                    this.alignmentActive = true;
                }
            }

            if (this.alignmentActive) apply(b1.acceleration, b1.velocity, alignment, alignmentForce, maxVelocity), this.alignmentActive = false;
            if (this.cohesionActive) apply(b1.acceleration, b1.velocity, cohesion, cohesionForce, maxVelocity), this.cohesionActive = false;
            if (this.separationActive) apply(b1.acceleration, b1.velocity, separation, separationForce, maxVelocity), this.separationActive = false;
            if (this.guideActive) apply(b1.acceleration, b1.velocity, guide, guideForce, maxVelocity);
        }

        for (let i = 0; i < boids.length; i++) {
            const { velocity, acceleration, position, rotation, idle } = boids[i];
            if (idle) continue;

            truncateV3(Vec3.add(velocity, velocity, acceleration), maxVelocity);
            // if (velocity.x < -boundingRadius) velocity.x = Math.abs(velocity.x);
            // if (velocity.y < -boundingRadius) velocity.y = Math.abs(velocity.y);
            // if (velocity.z < -boundingRadius) velocity.z = Math.abs(velocity.z);
            // if (velocity.x > boundingRadius) velocity.x = -Math.abs(velocity.x);
            // if (velocity.y > boundingRadius) velocity.y = -Math.abs(velocity.y);
            // if (velocity.z > boundingRadius) velocity.z = -Math.abs(velocity.z);
            Vec3.add(position, position, velocity);
            if      (position.x < -boundingRadius) position.x += boundingRadius * 2;
            else if (position.x >  boundingRadius) position.x -= boundingRadius * 2;
            if      (position.y < -boundingRadius) position.y += boundingRadius * 2;
            else if (position.y >  boundingRadius) position.y -= boundingRadius * 2;
            if      (position.z < -boundingRadius) position.z += boundingRadius * 2;
            else if (position.z >  boundingRadius) position.z -= boundingRadius * 2;
            Quat.fromViewUp(rotation, Vec3.normalize(v3_1, velocity));
        }
    }
}

@ccclass('Crowd')
export class Crowd extends Component {

    @property
    count = 10;

    @property(Prefab)
    prefab: Prefab = null;

    flock = new Flock();
    animComps: SkeletalAnimationComponent[] = [];
    nextIdleSwitches: number[] = [];

    // reference
    radius = 0;

    start () {
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
        for (let i = 0; i < this.count; i++) {
            const inst = instantiate(this.prefab) as Node;
            inst.setPosition(randomRange(-this.radius, this.radius), 0, randomRange(-this.radius, this.radius));
            inst.parent = this.node;
            // this.flock.addBoid();
            // const idle = this.flock.boids[i].idle = random() > 0.7;
            // this.nextIdleSwitches.push(idle ? randomRange(5, 20) : randomRange(1, 10));
            // const animComp = inst.getComponent(SkeletalAnimationComponent);
            // animComp.play(idle ? 'Root|Idle' : 'Root|Run');
            // this.animComps.push(animComp);
        }
    }

    // update (dt: number) {
    //     const boids = this.flock.boids;
    //     const nodes = this.node.children;
    //     const nextIdleSwitches = this.nextIdleSwitches;
    //     for (let i = 0; i < nextIdleSwitches.length; i++) {
    //         const node = nodes[i];
    //         const boid = boids[i];
    //         nextIdleSwitches[i] -= dt;
    //         if (nextIdleSwitches[i] < 0) {
    //             boid.idle = !boid.idle;
    //             this.animComps[i].play(boid.idle ? 'Root|Idle' : 'Root|Run');
    //             nextIdleSwitches[i] = boid.idle ? randomRange(5, 20) : randomRange(1, 10);
    //         }
    //     }
    //     this.flock.update();
    //     for (let i = 0; i < nodes.length; i++) {
    //         const node = nodes[i];
    //         const boid = boids[i];
    //         node.setPosition(boid.position);
    //         node.setRotation(boid.rotation);
    //     }
    // }

    // setSeperation (e: SliderComponent) {
    //     this.flock.separationForce = e.progress * 0.25;
    // }
    // setCohesion (e: SliderComponent) {
    //     this.flock.cohesionForce = e.progress * 0.25;
    // }
    // setAlignment (e: SliderComponent) {
    //     this.flock.alignmentForce = e.progress * 0.25;
    // }
}
