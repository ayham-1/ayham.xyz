---
title: "libumdr"
params:
    devstatus: "Active"
    projlink: "closed-source"
    lastupdate: "*"
    creationdate: "2025-04-17"
    img: "pix/proj/libumdr.webp"
---

A modular framework written in C for the UMD Racing formula student car, 
based on FreeRTOS and STM32HAL libraries. Provides software for all 
low-voltage, in-house designed PCBs of the UMD car. libumdr is meant to 
abstract away low-level communication handling of the CAN-bus by managing 
output and input timings and ensuring no dropped frames at a library-level. It 
also provides the more abstract components of the car such as the car logic and 
state handling. The design of the different included systems is modular, 
allowing for easily and dynamically integrating the car's software and the 
PCB's capabilities, and by extension, a faster production of each formula 
student season's car.
