//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////


module egret {

    /**
     * @private
     */
    export class FrameLabel extends EventDispatcher
    {
        private _name: string;
        private _frame: number /*int*/;
        private _end: number = 0;/*int*/

        constructor (name: string, frame: number /*int*/,end?:any/*int*/)
        {
            super();
            this._name = name;
            this._frame = frame | 0;
            this._end = end | 0;
        }

        /**
         * 标签名
         * @member {string} egret.FrameLabel#name
         */
        public get name(): string {
            return this._name;
        }

        /**
         * 标签所在帧序号
         * @member {number} egret.FrameLabel#frame
         */
        public get frame(): number /*int*/ {
            return this._frame;
        }
        /**
         * 标签对应的结束帧序号
         * @member {number} egret.FrameLabel#frame
         */
        public get end(): number /*int*/ {
            return this._end;
        }
        /**
         * 复制当前帧标签对象
         * @method egret.FrameLabel#clone
         */
        public clone() {
            return new FrameLabel(this._name, this._frame);
        }
    }

}


