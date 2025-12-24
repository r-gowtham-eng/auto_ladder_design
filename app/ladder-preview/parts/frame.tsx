import makerjs, { model } from "makerjs";

export function FramePart(): makerjs.IModel {
  const numberOfSteps = 4;
  const stepHeight = 250;
  let stepWidth = 225;
  const topStepWidth = 500;
  const rodWidth = 40;
  const sideRodHeight = 250;
  const bottomRodHeight = 40;
  let bottomRodWidth = 870;
  const groundClearance = 80;
  let minstepRodHeight = stepHeight - (groundClearance + bottomRodHeight)

    
    // to calculate the bottom width we will have to add the step width - the rod width.
    // to calculate the right side rod height we have to multiply the number of steps x step height
    bottomRodWidth = ((stepWidth * (numberOfSteps - 1)) + topStepWidth)  - (rodWidth + rodWidth);
    const sideFrame: { models: { [key: string]: any } } = {
        models: {
            sideLegLeft : new makerjs.models.Rectangle(rodWidth,sideRodHeight),
            bottomRod : new makerjs.models.Rectangle(bottomRodWidth, bottomRodHeight),
            sideLegRight : new makerjs.models.Rectangle(rodWidth,numberOfSteps * stepHeight),
        }
    };
    // this for loop is for steps
     for (let i = 0; i < numberOfSteps; i++) {
        let stepW = stepWidth; 
        if (i === numberOfSteps - 1) {
            stepW = topStepWidth;
        }
        const step = new makerjs.models.Rectangle(stepW, rodWidth);
        const stepY = stepHeight * (i + 1) ;
        step.origin = [stepWidth * i, stepY - rodWidth];
        // step.origin = [0,250];
        sideFrame.models![`step_${i}`] = step;
    }
    // this for loop is for step rods
    for (let i = 1; i < numberOfSteps; i++) {
        let stepRodH = (stepHeight * i) + minstepRodHeight;
        const stepRod = new makerjs.models.Rectangle(rodWidth, stepRodH);
        stepRod.origin = [stepWidth * i,groundClearance + bottomRodHeight];
        sideFrame.models![`stepRod_${i}`] = stepRod;


    }

    sideFrame.models.bottomRod.origin = [rodWidth, groundClearance];
    sideFrame.models.sideLegRight.origin = [bottomRodWidth + rodWidth, 0];
    return sideFrame;
}

