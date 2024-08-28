/** 
 * @file pxt-yfrobot-valon3/valon3.ts
 * @brief YFROBOT's valon3 V3.0 makecode library.
 * @n This is a MakeCode graphical programming education robot.
 * 
 * @copyright    YFROBOT,2024
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2024-08-27
*/

// ultrasonic pin
let valon_distanceBuf = 0
// motor pin 
let valonMotorLD = DigitalPin.P13
let valonMotorLA = AnalogPin.P14
let valonMotorRD = DigitalPin.P15
let valonMotorRA = AnalogPin.P16
// patrol pin
let valonPatrolLeftMost = DigitalPin.P6
let valonPatrolLeft = DigitalPin.P1
let valonPatrolMiddle = DigitalPin.P2
let valonPatrolRight = DigitalPin.P8
let valonPatrolRightMost = DigitalPin.P7
// valon patrol mode
let valon3_patrolMode = 0

enum PingUnit {
    //% block="cm"
    Centimeters,
}

//% color="#39d243" weight=10 icon="\uf1b0"
namespace valon3 {

    // IR
    const MICROBIT_IR_NEC = 777
    const MICROBIT_IR_BUTTON_PRESSED_ID = 789
    const MICROBIT_IR_BUTTON_RELEASED_ID = 790
    const IR_REPEAT = 256
    const IR_INCOMPLETE = 257

    let irState: IrState
    interface IrState {
        protocol: IrProtocol;
        command: number;
        hasNewCommand: boolean;
        bitsReceived: uint8;
        commandBits: uint8;
    }

    export enum Motors {
        //% blockId="leftMotor" block="left"
        ML = 0,
        //% blockId="rightMotor" block="right"
        MR = 1,
        //% blockId="allMotors" block="all"
        MAll = 2
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }

    export enum PatrolEnable {
        //% blockId="PatrolOn" block="ON"
        PatrolOn = 0x01,
        //% blockId="PatrolOff" block="OFF"
        PatrolOff = 0x00
    }

    export enum SensorMode {
        //% blockId="Mode3" block="3"
        M3 = 3,
        //% blockId="Mode5" block="5"
        M5 = 5
    }

    export enum Patrol {
        //% blockId="patrolLeftMost" block="leftMost"
        PatrolLeftMost = 6,
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 1,
        //% blockId="patrolMiddle" block="middle"
        PatrolMiddle = 2,
        //% blockId="patrolRight" block="right"
        PatrolRight = 8,
        //% blockId="patrolRightMost" block="rightMost"
        PatrolRightMost = 7
    }

    // IR
    export enum IrProtocol {
        //% block="Keyestudio"
        Keyestudio = 0,
        //% block="NEC"
        NEC = 1,
    }

    export enum IrButtonAction {
        //% blockId="Pressed" block="pressed"
        Pressed = 0,
        //% blockId="Released" block="released"
        Released = 1,
    }

    export enum IrButton {
        // any button
        //% block="Any"
        Any = -1,

        //IR HANDLE
        //% block="↑"
        UP = 0x11,
        //% block="↓"
        DOWN = 0x91,
        //% block="←"
        LEFT = 0x81,
        //% block="→"
        RIGHT = 0xa1,
        //% block="M1"
        M1 = 0xe9,
        //% block="M2"
        M2 = 0x69,
        //% block="A"
        A = 0x21,
        //% block="B"
        B = 0x01,

        // MINI IR 
        //% block="A"
        Mini_A = 0xa2,
        //% block="B"
        Mini_B = 0x62,
        //% block="C"
        Mini_C = 0xe2,
        //% block="D"
        Mini_D = 0x22,
        //% block="︿"
        Mini_UP = 0x02,
        //% block="E"
        Mini_E = 0xc2,
        //% block="＜"
        Mini_Left = 0xe0,
        //% block="۞"
        Mini_SET = 0xa8,
        //% block="＞"
        Mini_Right = 0x90,
        //% block="0"
        Number_0 = 0x68,
        //% block="﹀"
        Mini_Down = 0x98,
        //% block="F"
        Mini_F = 0xb0,
        //% block="1"
        Number_1 = 0x30,
        //% block="2"
        Number_2 = 0x18,
        //% block="3"
        Number_3 = 0x7a,
        //% block="4"
        Number_4 = 0x10,
        //% block="5"
        Number_5 = 0x38,
        //% block="6"
        Number_6 = 0x5a,
        //% block="7"
        Number_7 = 0x42,
        //% block="8"
        Number_8 = 0x4a,
        //% block="9"
        Number_9 = 0x52,
    }

    /**
     * MOTOR CONTROL FUNCTIONS.
     */

    function clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(max, value), min);
    }

    /**
     * Set the direction and speed of valon3 motor.
     * @param index motor left/right/all
     * @param direction direction to turn
     * @param speed speed of motors (0 to 255). eg: 120
     */
    
    //% group="Motor control"
    //% weight=90
    //% blockId=valon_motor_MotorRun block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=3
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index > 2 || index < 0)
            return

        speed = clamp(speed, 0, 255) * 4.01;  // 0~255 > 0~1023

        if (index == valon3.Motors.ML) {
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        } else if (index == Motors.MR) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
        } else if (index == Motors.MAll) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        }
    }

    /**
     * Stop the valon3 motor.
     * @param motor motor ML/MR/MAll. eg: valon3.Motors.MAll
     */
    //% group="Motor control"
    //% weight=89
    //% blockId=valon_motor_motorStop block="motor |%motor stop"
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=3 
    export function motorStop(motor: Motors): void {
        motorRun(motor, 0, 0);
    }

    /**
      * Enable or Disable line tracking sensor.
      * @param enable line tracking sensor enable signal(0 or 1), eg: valon3.PatrolEnable.PatrolOn
      * @param sMode line tracking sensor mode 3 or 5 sensors, eg: valon3.SensorMode.M3
      */
    //% group="LineFollow sensor"
    //% weight=81
    //% blockId=valon_Patrol_enable block="line tracking sensor %enable %sMode"
    //% enable.fieldEditor="gridpicker" enable.fieldOptions.columns=2
    //% sMode.fieldEditor="gridpicker" sMode.fieldOptions.columns=2
    export function enablePatrol(enable: PatrolEnable, sMode: SensorMode): void {
        pins.digitalWritePin(DigitalPin.P12, enable);
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P8, PinPullMode.PullNone)
        if(sMode === valon3.SensorMode.M5){
            valon3_patrolMode = 5;
            led.enable(false);
            pins.setPull(DigitalPin.P6, PinPullMode.PullNone)
            pins.setPull(DigitalPin.P7, PinPullMode.PullNone)
        }else{
            valon3_patrolMode = 3;
        }
        
    }

    /**
      * Read line tracking sensor.
      * @param patrol patrol sensor number, eg: valon3.Patrol.PatrolMiddle.
      */
    //% group="LineFollow sensor"
    //% weight=80
    //% blockId=valon_read_Patrol block="read %patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=3 
    export function readPatrol(patrol: Patrol): number {
        if (valon3_patrolMode === 5) {
            if (patrol == Patrol.PatrolLeftMost) {
                return pins.digitalReadPin(valonPatrolLeftMost)
            } 
            if (patrol == Patrol.PatrolRightMost) {
                return pins.digitalReadPin(valonPatrolRightMost)
            }
        }

        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(valonPatrolLeft)
        } else if (patrol == Patrol.PatrolMiddle) {
            return pins.digitalReadPin(valonPatrolMiddle)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(valonPatrolRight)
        } else {
            return -1
        }

    }

    

    /**
     * Read ultrasonic sensor.
     * @param tpin Sonar sensor trigger pin. eg: DigitalPin.P9
     * @param epin Sonar sensor echo pin. eg: DigitalPin.P0
     */
    //% group="Sonar sensor"
    //% weight=70
    //% inlineInputMode=inline
    //% blockId=valon_ultrasonic_sensor block="read ultrasonic sensor TPin |%tpin EPin |%epin |%unit"
    //% tpin.fieldEditor="gridpicker" tpin.fieldOptions.columns=4
    //% tpin.fieldOptions.tooltips="false"
    //% epin.fieldEditor="gridpicker" epin.fieldOptions.columns=4
    //% epin.fieldOptions.tooltips="false"
    export function Ultrasonic(tpin: DigitalPin, epin: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(tpin, PinPullMode.PullNone);
        pins.digitalWritePin(tpin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(tpin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(tpin, 0);

        // read pulse
        // d = pins.pulseIn(epin, PulseValue.High, maxCmDistance * 58);  // 8 / 340 = 
        let d = pins.pulseIn(epin, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && valon_distanceBuf != 0) {
            ret = valon_distanceBuf;
        }
        valon_distanceBuf = d;

        // return Math.floor(ret * 9 / 6 / 58);
        return Math.floor(ret / 58);
        // switch (unit) {
        //     case ValonPingUnit.Centimeters: return Math.idiv(d, 58);
        //     default: return d;
        // }
    }


    /***************** IR *******************/
    
    function pushBit(bit: number): number {
        irState.bitsReceived += 1;
        if (irState.bitsReceived <= 8) {
            // ignore all address bits
            if (irState.protocol === IrProtocol.Keyestudio && bit === 1) {
                // recover from missing message bits at the beginning
                // Keyestudio address is 0 and thus missing bits can be easily detected
                // by checking for the first inverse address bit (which is a 1)
                irState.bitsReceived = 9;
            }
            return IR_INCOMPLETE;
        }
        if (irState.bitsReceived <= 16) {
            // ignore all inverse address bits
            return IR_INCOMPLETE;
        } else if (irState.bitsReceived < 24) {
            irState.commandBits = (irState.commandBits << 1) + bit;
            return IR_INCOMPLETE;
        } else if (irState.bitsReceived === 24) {
            irState.commandBits = (irState.commandBits << 1) + bit;
            return irState.commandBits & 0xff;
        } else {
            // ignore all inverse command bits
            return IR_INCOMPLETE;
        }
    }

    function detectCommand(markAndSpace: number): number {
        if (markAndSpace < 1600) {
            // low bit
            return pushBit(0);
        } else if (markAndSpace < 2700) {
            // high bit
            return pushBit(1);
        }

        irState.bitsReceived = 0;

        if (markAndSpace < 12500) {
            // Repeat detected
            return IR_REPEAT;
        } else if (markAndSpace < 14500) {
            // Start detected
            return IR_INCOMPLETE;
        } else {
            return IR_INCOMPLETE;
        }
    }

    function enableIrMarkSpaceDetection(pin: DigitalPin) {
        pins.setPull(pin, PinPullMode.PullNone);

        let mark = 0;
        let space = 0;

        pins.onPulsed(pin, PulseValue.Low, () => {
            // HIGH, see https://github.com/microsoft/pxt-microbit/issues/1416
            mark = pins.pulseDuration();
        });

        pins.onPulsed(pin, PulseValue.High, () => {
            // LOW
            space = pins.pulseDuration();
            const command = detectCommand(mark + space);
            if (command !== IR_INCOMPLETE) {
                control.raiseEvent(MICROBIT_IR_NEC, command);
            }
        });
    }

    /**
     * Connects to the IR receiver module at the specified pin and configures the IR protocol.
     * @param pin IR receiver pin. eg: DigitalPin.P3
     * @param protocol IR protocol. eg: valon3.IrProtocol.NEC
     */
    //% group="IR_Receiver"
    //% blockId="valon_infrared_connect_receiver"
    //% block="connect IR receiver at pin %pin and decode %protocol"
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=4
    //% pin.fieldOptions.tooltips="false"
    //% weight=15
    export function connectIrReceiver(pin: DigitalPin, protocol: IrProtocol): void {
        if (irState) {
            return;
        }

        irState = {
            protocol: protocol,
            bitsReceived: 0,
            commandBits: 0,
            command: IrButton.Any,
            hasNewCommand: false,
        };

        enableIrMarkSpaceDetection(pin);

        let activeCommand = IR_INCOMPLETE;
        let repeatTimeout = 0;
        const REPEAT_TIMEOUT_MS = 120;

        control.onEvent(
            MICROBIT_IR_NEC,
            EventBusValue.MICROBIT_EVT_ANY,
            () => {
                const necValue = control.eventValue();

                // Refresh repeat timer
                if (necValue <= 255 || necValue === IR_REPEAT) {
                    repeatTimeout = input.runningTime() + REPEAT_TIMEOUT_MS;
                }

                // Process a new command
                if (necValue <= 255 && necValue !== activeCommand) {
                    if (activeCommand >= 0) {
                        control.raiseEvent(
                            MICROBIT_IR_BUTTON_RELEASED_ID,
                            activeCommand
                        );
                    }

                    irState.hasNewCommand = true;
                    irState.command = necValue;
                    activeCommand = necValue;
                    control.raiseEvent(MICROBIT_IR_BUTTON_PRESSED_ID, necValue);
                }
            }
        );

        control.inBackground(() => {
            while (true) {
                if (activeCommand === IR_INCOMPLETE) {
                    // sleep to save CPU cylces
                    basic.pause(2 * REPEAT_TIMEOUT_MS);
                } else {
                    const now = input.runningTime();
                    if (now > repeatTimeout) {
                        // repeat timed out
                        control.raiseEvent(
                            MICROBIT_IR_BUTTON_RELEASED_ID,
                            activeCommand
                        );
                        activeCommand = IR_INCOMPLETE;
                    } else {
                        basic.pause(REPEAT_TIMEOUT_MS);
                    }
                }
            }
        });
    }

    /**
     * Do something when a specific button is pressed or released on the remote control.
     * @param button the button to be checked
     * @param action the trigger action
     * @param handler body code to run when event is raised
     */
    //% group="IR_Receiver"
    //% weight=13
    //% blockId=valon_infrared_on_ir_button
    //% block="on IR button | %button | %action"
    //% button.fieldEditor="gridpicker" button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    export function onIrButton(button: IrButton, action: IrButtonAction, handler: () => void) {
        control.onEvent(
            action === IrButtonAction.Pressed
                ? MICROBIT_IR_BUTTON_PRESSED_ID
                : MICROBIT_IR_BUTTON_RELEASED_ID,
            button === IrButton.Any ? EventBusValue.MICROBIT_EVT_ANY : button,
            () => {
                irState.command = control.eventValue();
                handler();
            }
        );
    }

    /**
     * Returns the code of the IR button that was pressed last. Returns -1 (IrButton.Any) if no button has been pressed yet.
     */
    //% group="IR_Receiver"
    //% blockId=valon_infrared_ir_button_pressed
    //% block="IR button"
    //% weight=10
    export function irButton(): number {
        if (!irState) {
            return IrButton.Any;
        }
        return irState.command;
    }

    /**
     * Returns true if any button was pressed since the last call of this function. False otherwise.
     */
    //% group="IR_Receiver"
    //% blockId=valon_infrared_was_any_button_pressed
    //% block="any IR button was pressed"
    //% weight=7
    export function wasAnyIrButtonPressed(): boolean {
        if (!irState) {
            return false;
        }
        if (irState.hasNewCommand) {
            irState.hasNewCommand = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the command code of a specific IR button.
     * @param button the button
     */
    //% group="IR_Receiver"
    //% blockId=valon_infrared_button_code
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% block="IR button code %button"
    //% weight=5
    export function irButtonCode(button: IrButton): number {
        return button as number;
    }
}
