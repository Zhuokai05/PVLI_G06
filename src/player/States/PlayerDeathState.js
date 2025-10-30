import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerDeathState extends BaseState {
    enter(player) {
        player.setVelocityX(0);
        player.destroy()
    }

    execute(player) {

    }
}