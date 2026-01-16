"use client";

import { motion } from "framer-motion";

interface LogoProps {
  showText: boolean;
}

export default function Logo({ showText }: LogoProps) {
  return (
    <div className="flex items-baseline overflow-visible h-9 select-none min-w-[120px] pl-6 pr-6">
      {/* 
         === 文字部分 "Presto" ===
         配合点的动作，它的展开/收起需要卡在点“蓄力结束”发射的那一瞬间。
      */}
      <motion.div
        initial={false}
        animate={showText ? "expanded" : "collapsed"}
        variants={{
          expanded: {
            width: "auto",
            opacity: 1,
            // 展开时：延迟 0.35s，因为前 0.35s 点在向左蓄力，还没开始往右跑
            transition: { duration: 0.7, delay: 0.35, ease: "easeOut" }
          },
          collapsed: {
            width: 0,
            opacity: 0,
            // 收起时：延迟 0.35s，因为前 0.35s 点在向右蓄力，还没开始往左擦
            transition: { duration: 0.6, delay: 0.35, ease: "easeInOut" }
          }
        }}
        className="font-logo text-2xl leading-none tracking-tight whitespace-nowrap overflow-hidden text-foreground mr-[1px]"
      >
        Presto
      </motion.div>

      {/* 
         === 点 "." (主角) ===
         演绎物理过程：静止 -> 反向大幅蓄力 -> 发射/撞击 -> 惯性冲过头 -> 回弹归位
      */}
      <motion.div
        layout // 核心：让点跟随 Flex 布局自动移动，我们只需要叠加 x 轴的相对位移
        animate={showText ? "expanded" : "collapsed"}
        variants={{
          expanded: {
            // 展开动作 (. -> Presto.)
            // 0: 静止
            // -22: 大幅向左后撤 (蓄力)
            // 12: 随着文字刷出来，惯性导致它冲过头往右飞了 12px
            // 0: 弹簧回正
            x: [0, -22, 12, 0],
            transition: { 
                duration: 1.1, // 整体变慢
                times: [0, 0.35, 0.75, 1], // 35%的时间都在蓄力，中间冲刺，最后回弹
                ease: "easeInOut" 
            }
          },
          collapsed: {
            // 收起动作 (Presto. -> .)
            // 0: 静止
            // 25: 大幅向右后撤 (像是举起橡皮擦准备砸下去)
            // -10: 擦除完毕，惯性导致它往左冲过头撞墙
            // 0: 弹簧回正
            x: [0, 25, -10, 0], 
            transition: { 
                duration: 1.0, // 整体变慢
                times: [0, 0.35, 0.75, 1], // 节奏同上
                ease: "easeInOut" 
            }
          }
        }}
        className="font-logo text-2xl leading-none tracking-tight text-foreground relative z-10"
      >
        .
      </motion.div>
    </div>
  );
}