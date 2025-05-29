document.addEventListener('DOMContentLoaded', function() {
    // 获取Canvas元素和上下文
    const canvas = document.getElementById('transformCanvas');
    const ctx = canvas.getContext('2d');
    
    // 设置Canvas大小
    canvas.width = 500;
    canvas.height = 500;
    
    // 获取控制元素
    const kxInput = document.getElementById('shearX');
    const kyInput = document.getElementById('shearY');
    const kxValue = document.getElementById('shearXValue');
    const kyValue = document.getElementById('shearYValue');
    const resetBtn = document.getElementById('resetBtn');
    const animateBtn = document.getElementById('animateBtn');
    const applyCoordinatesBtn = document.getElementById('applyCoordinatesBtn');
    const nextPointBtn = document.getElementById('nextPointBtn');
    
    // 获取坐标输入元素
    const pointInputs = {
        A: { x: document.getElementById('pointAX'), y: document.getElementById('pointAY') },
        B: { x: document.getElementById('pointBX'), y: document.getElementById('pointBY') },
        C: { x: document.getElementById('pointCX'), y: document.getElementById('pointCY') },
        D: { x: document.getElementById('pointDX'), y: document.getElementById('pointDY') }
    };
    
    // 矩阵元素
    const m12 = document.getElementById('m12');
    const m21 = document.getElementById('m21');
    
    // 坐标显示元素
    const originalCoords = document.getElementById('originalCoords');
    const transformedCoords = document.getElementById('transformedCoords');
    
    // 公式可视化元素
    const currentPointDisplay = document.getElementById('currentPoint');
    const xPart = document.querySelector('.x-part');
    const yPart = document.querySelector('.y-part');
    const kxPart = document.querySelector('.kx-part');
    const kyPart = document.querySelector('.ky-part');
    const xResult = document.querySelector('.x-result');
    const yResult = document.querySelector('.y-result');
    
    // 定义坐标系参数
    const gridSize = 25;  // 每个网格单元的像素大小
    const gridUnit = 10;  // 每个网格单元代表的实际坐标单位
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    // 定义角点标记
    const cornerLabels = ['A', 'B', 'C', 'D'];
    
    // 定义颜色
    const colors = {
        focusPoint: '#ff6600',        // 橙色 - 当前焦点点
        focusPointBorder: '#e65c00',  // 深橙色 - 当前焦点点边框
        originalPoint: '#0066cc',     // 蓝色 - 原始点
        transformedPoint: '#cc0066',  // 粉色 - 变换后的点
        originalShape: 'rgba(102, 204, 255, 0.3)', // 半透明蓝色 - 原始形状
        transformedShape: 'rgba(204, 102, 153, 0.5)' // 半透明粉色 - 变换后形状
    };
    
    // 当前焦点点索引
    let currentPointIndex = 0;
    
    // 创建图像对象
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAxMDAgODAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiM2NmNjZmYiIHN0cm9rZT0iIzAwNjZjYyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDMzNjYiPuefqeW9ojwvdGV4dD48L3N2Zz4=';
    
    // 存储当前坐标点
    let currentPoints = [
        { x: -50, y: 40 },  // A: 左上角
        { x: 50, y: 40 },   // B: 右上角
        { x: 50, y: -40 },  // C: 右下角
        { x: -50, y: -40 }  // D: 左下角
    ];
    
    // 计算原始矩形的四个角坐标
    function calculateOriginalCoordinates() {
        return currentPoints;
    }
    
    // 应用切变变换
    function applyShearTransform(point, kx, ky) {
        return {
            x: point.x + kx * point.y,
            y: ky * point.x + point.y
        };
    }
    
    // 读取用户输入的坐标
    function readUserCoordinates() {
        return [
            { 
                x: parseFloat(pointInputs.A.x.value), 
                y: parseFloat(pointInputs.A.y.value) 
            },
            { 
                x: parseFloat(pointInputs.B.x.value), 
                y: parseFloat(pointInputs.B.y.value) 
            },
            { 
                x: parseFloat(pointInputs.C.x.value), 
                y: parseFloat(pointInputs.C.y.value) 
            },
            { 
                x: parseFloat(pointInputs.D.x.value), 
                y: parseFloat(pointInputs.D.y.value) 
            }
        ];
    }
    
    // 更新坐标显示
    function updateCoordinatesDisplay(originalPoints, transformedPoints) {
        originalCoords.innerHTML = '';
        transformedCoords.innerHTML = '';
        
        for (let i = 0; i < originalPoints.length; i++) {
            const originalLi = document.createElement('li');
            originalLi.textContent = `点 ${cornerLabels[i]}: (${originalPoints[i].x.toFixed(1)}, ${originalPoints[i].y.toFixed(1)})`;
            
            // 高亮当前焦点点
            if (i === currentPointIndex) {
                originalLi.style.color = colors.focusPoint;
                originalLi.style.fontWeight = 'bold';
            }
            
            originalCoords.appendChild(originalLi);
            
            const transformedLi = document.createElement('li');
            transformedLi.textContent = `点 ${cornerLabels[i]}: (${transformedPoints[i].x.toFixed(1)}, ${transformedPoints[i].y.toFixed(1)})`;
            
            // 高亮当前焦点点
            if (i === currentPointIndex) {
                transformedLi.style.color = colors.focusPoint;
                transformedLi.style.fontWeight = 'bold';
            }
            
            transformedCoords.appendChild(transformedLi);
        }
    }
    
    // 更新公式可视化
    function updateFormulaVisualization(originalPoints, transformedPoints, kx, ky) {
        // 获取当前焦点点
        const originalPoint = originalPoints[currentPointIndex];
        const transformedPoint = transformedPoints[currentPointIndex];
        
        // 更新当前点显示
        currentPointDisplay.textContent = cornerLabels[currentPointIndex];
        
        // 更新公式部分的内容
        xPart.textContent = `X (${originalPoint.x.toFixed(1)})`;
        yPart.textContent = ` + Y (${originalPoint.y.toFixed(1)})`;
        kxPart.textContent = ` + k_x × Y (${kx.toFixed(1)} × ${originalPoint.y.toFixed(1)})`;
        kyPart.textContent = `k_y × X (${ky.toFixed(1)} × ${originalPoint.x.toFixed(1)})`;
        
        // 更新结果
        xResult.textContent = transformedPoint.x.toFixed(1);
        yResult.textContent = transformedPoint.y.toFixed(1);
        
        // 执行动画效果
        animateFormulaCalculation(originalPoint, transformedPoint, kx, ky);
    }
    
    // 公式计算动画
    function animateFormulaCalculation(originalPoint, transformedPoint, kx, ky) {
        // 移除现有的高亮
        document.querySelectorAll('.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        
        // 动画序列
        setTimeout(() => {
            xPart.classList.add('highlight');
            yPart.classList.remove('highlight');
            kxPart.classList.remove('highlight');
            kyPart.classList.remove('highlight');
        }, 0);
        
        setTimeout(() => {
            xPart.classList.remove('highlight');
            kxPart.classList.add('highlight');
        }, 800);
        
        setTimeout(() => {
            xResult.classList.add('highlight');
        }, 1600);
        
        setTimeout(() => {
            kyPart.classList.add('highlight');
            kxPart.classList.remove('highlight');
            xResult.classList.remove('highlight');
        }, 2400);
        
        setTimeout(() => {
            kyPart.classList.remove('highlight');
            yPart.classList.add('highlight');
        }, 3200);
        
        setTimeout(() => {
            yResult.classList.add('highlight');
        }, 4000);
        
        // 最后清除所有高亮
        setTimeout(() => {
            document.querySelectorAll('.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
        }, 5000);
    }
    
    // 切换到下一个点
    function nextPoint() {
        currentPointIndex = (currentPointIndex + 1) % 4;
        const kx = parseFloat(kxInput.value);
        const ky = parseFloat(kyInput.value);
        const originalPoints = calculateOriginalCoordinates();
        const transformedPoints = originalPoints.map(point => applyShearTransform(point, kx, ky));
        updateFormulaVisualization(originalPoints, transformedPoints, kx, ky);
        updateView();
    }
    
    // 坐标转换：将数学坐标系转换为Canvas坐标系
    function mathToCanvas(point) {
        return {
            x: originX + point.x * (gridSize / gridUnit),
            y: originY - point.y * (gridSize / gridUnit)  // 注意这里是减法，因为数学坐标系中y轴向上为正
        };
    }
    
    // 绘制坐标系
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        
        // 垂直网格线
        for (let x = originX % gridSize; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 水平网格线
        for (let y = originY % gridSize; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // 绘制坐标轴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(canvas.width, originY);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, canvas.height);
        ctx.stroke();
        
        // 绘制轴标签
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // X轴标签
        ctx.fillText('X', canvas.width - 15, originY + 15);
        
        // Y轴标签
        ctx.fillText('Y', originX + 15, 15);
        
        // 原点标签
        ctx.fillText('O', originX - 10, originY + 15);
        
        // 绘制刻度
        ctx.font = '12px Arial';
        
        // X轴刻度
        for (let i = 1; i <= 10; i++) {
            const x = originX + i * gridSize;
            const value = i * gridUnit;
            if (x < canvas.width) {
                ctx.fillText(value.toString(), x, originY + 15);
            }
            
            const negX = originX - i * gridSize;
            if (negX > 0) {
                ctx.fillText((-value).toString(), negX, originY + 15);
            }
        }
        
        // Y轴刻度
        for (let i = 1; i <= 10; i++) {
            const y = originY - i * gridSize;
            const value = i * gridUnit;
            if (y > 0) {
                ctx.fillText(value.toString(), originX - 15, y);
            }
            
            const negY = originY + i * gridSize;
            if (negY < canvas.height) {
                ctx.fillText((-value).toString(), originX - 15, negY);
            }
        }
    }
    
    // 绘制多边形
    function drawPolygon(ctx, points) {
        if (points.length < 3) return;
        
        ctx.beginPath();
        
        // 转换第一个点并移动到该位置
        const firstCanvasPoint = mathToCanvas(points[0]);
        ctx.moveTo(firstCanvasPoint.x, firstCanvasPoint.y);
        
        // 转换并连接其余点
        for (let i = 1; i < points.length; i++) {
            const canvasPoint = mathToCanvas(points[i]);
            ctx.lineTo(canvasPoint.x, canvasPoint.y);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // 绘制原始多边形和变换后的多边形
    function drawShapes(kx, ky) {
        // 获取原始坐标
        const originalPoints = calculateOriginalCoordinates();
        
        // 计算变换后的坐标
        const transformedPoints = originalPoints.map(point => 
            applyShearTransform(point, kx, ky)
        );
        
        // 更新坐标显示
        updateCoordinatesDisplay(originalPoints, transformedPoints);
        
        // 更新公式可视化
        updateFormulaVisualization(originalPoints, transformedPoints, kx, ky);
        
        // 设置填充样式和描边样式
        ctx.fillStyle = colors.originalShape;
        ctx.strokeStyle = colors.originalPoint;
        ctx.lineWidth = 2;
        
        // 绘制原始多边形
        drawPolygon(ctx, originalPoints);
        
        // 设置标记原始点的样式
        ctx.fillStyle = colors.originalPoint;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 先绘制所有非当前点
        originalPoints.forEach((point, index) => {
            if (index !== currentPointIndex) {
                // 转换为Canvas坐标
                const canvasPoint = mathToCanvas(point);
                
                // 绘制点
                ctx.beginPath();
                ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制标签
                const offsetX = (index === 0 || index === 3) ? -10 : 10;
                const offsetY = (index === 0 || index === 1) ? -10 : 10;
                ctx.fillText(cornerLabels[index], canvasPoint.x + offsetX, canvasPoint.y + offsetY);
            }
        });
        
        // 设置变换后多边形的样式
        ctx.fillStyle = colors.transformedShape;
        ctx.strokeStyle = colors.transformedPoint;
        ctx.lineWidth = 2;
        
        // 绘制变换后的多边形
        drawPolygon(ctx, transformedPoints);
        
        // 设置标记变换点的样式
        ctx.fillStyle = colors.transformedPoint;
        
        // 先绘制所有非当前点
        transformedPoints.forEach((point, index) => {
            if (index !== currentPointIndex) {
                // 转换为Canvas坐标
                const canvasPoint = mathToCanvas(point);
                
                // 绘制点
                ctx.beginPath();
                ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制标签
                const offsetX = (index === 0 || index === 3) ? -10 : 10;
                const offsetY = (index === 0 || index === 1) ? -10 : 10;
                ctx.fillText(cornerLabels[index] + "'", canvasPoint.x + offsetX, canvasPoint.y + offsetY);
            }
        });
        
        // 绘制从原始点到变换点的箭头
        drawTransformationArrow(originalPoints[currentPointIndex], transformedPoints[currentPointIndex]);
        
        // 在最后单独绘制当前焦点点，确保它不会被其他元素覆盖
        // 绘制原始点
        const originalFocusPoint = mathToCanvas(originalPoints[currentPointIndex]);
        ctx.fillStyle = colors.focusPoint;
        ctx.strokeStyle = colors.focusPointBorder;
        ctx.lineWidth = 2;
        
        // 绘制外环
        ctx.beginPath();
        ctx.arc(originalFocusPoint.x, originalFocusPoint.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制内圆点
        ctx.beginPath();
        ctx.arc(originalFocusPoint.x, originalFocusPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制标签
        const originalOffsetX = (currentPointIndex === 0 || currentPointIndex === 3) ? -10 : 10;
        const originalOffsetY = (currentPointIndex === 0 || currentPointIndex === 1) ? -10 : 10;
        ctx.fillText(cornerLabels[currentPointIndex], originalFocusPoint.x + originalOffsetX, originalFocusPoint.y + originalOffsetY);
        
        // 绘制变换点
        const transformedFocusPoint = mathToCanvas(transformedPoints[currentPointIndex]);
        
        // 绘制外环
        ctx.beginPath();
        ctx.arc(transformedFocusPoint.x, transformedFocusPoint.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制内圆点
        ctx.beginPath();
        ctx.arc(transformedFocusPoint.x, transformedFocusPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制标签
        const transformedOffsetX = (currentPointIndex === 0 || currentPointIndex === 3) ? -10 : 10;
        const transformedOffsetY = (currentPointIndex === 0 || currentPointIndex === 1) ? -10 : 10;
        ctx.fillText(cornerLabels[currentPointIndex] + "'", transformedFocusPoint.x + transformedOffsetX, transformedFocusPoint.y + transformedOffsetY);
    }
    
    // 绘制从原始点到变换点的箭头
    function drawTransformationArrow(originalPoint, transformedPoint) {
        const start = mathToCanvas(originalPoint);
        const end = mathToCanvas(transformedPoint);
        
        // 绘制箭头线
        ctx.beginPath();
        ctx.strokeStyle = colors.focusPoint;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绘制箭头头部
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = colors.focusPoint;
        ctx.fill();
    }
    
    // 更新视图
    function updateView() {
        // 获取当前切变参数
        const kx = parseFloat(kxInput.value);
        const ky = parseFloat(kyInput.value);
        
        // 更新显示的值
        kxValue.textContent = kx.toFixed(1);
        kyValue.textContent = ky.toFixed(1);
        
        // 更新矩阵显示
        m12.textContent = kx.toFixed(1);
        m21.textContent = ky.toFixed(1);
        
        // 绘制
        drawGrid();
        drawShapes(kx, ky);
    }
    
    // 更新坐标输入框
    function updateCoordinateInputs() {
        pointInputs.A.x.value = currentPoints[0].x;
        pointInputs.A.y.value = currentPoints[0].y;
        pointInputs.B.x.value = currentPoints[1].x;
        pointInputs.B.y.value = currentPoints[1].y;
        pointInputs.C.x.value = currentPoints[2].x;
        pointInputs.C.y.value = currentPoints[2].y;
        pointInputs.D.x.value = currentPoints[3].x;
        pointInputs.D.y.value = currentPoints[3].y;
    }
    
    // 应用用户输入的坐标
    function applyUserCoordinates() {
        currentPoints = readUserCoordinates();
        updateView();
    }
    
    // 动画演示函数
    function animateTransform() {
        const targetKx = parseFloat(kxInput.value);
        const targetKy = parseFloat(kyInput.value);
        
        // 重置为初始状态
        let currentKx = 0;
        let currentKy = 0;
        kxInput.value = 0;
        kyInput.value = 0;
        
        // 设置动画步长
        const steps = 30;
        const incrementX = targetKx / steps;
        const incrementY = targetKy / steps;
        
        // 禁用控件
        kxInput.disabled = true;
        kyInput.disabled = true;
        animateBtn.disabled = true;
        applyCoordinatesBtn.disabled = true;
        nextPointBtn.disabled = true;
        Object.values(pointInputs).forEach(point => {
            point.x.disabled = true;
            point.y.disabled = true;
        });
        
        // 执行动画
        let step = 0;
        const animation = setInterval(() => {
            if (step >= steps) {
                // 动画结束，恢复控件
                clearInterval(animation);
                kxInput.value = targetKx;
                kyInput.value = targetKy;
                kxInput.disabled = false;
                kyInput.disabled = false;
                animateBtn.disabled = false;
                applyCoordinatesBtn.disabled = false;
                nextPointBtn.disabled = false;
                Object.values(pointInputs).forEach(point => {
                    point.x.disabled = false;
                    point.y.disabled = false;
                });
                updateView();
                return;
            }
            
            // 更新当前值
            currentKx += incrementX;
            currentKy += incrementY;
            
            // 更新滑块位置
            kxInput.value = currentKx;
            kyInput.value = currentKy;
            
            // 更新视图
            updateView();
            
            step++;
        }, 50);
    }
    
    // 重置函数
    function resetAll() {
        // 重置切变参数
        kxInput.value = 0;
        kyInput.value = 0;
        
        // 重置为默认坐标 - 注意：y值的正负已经调整以匹配数学坐标系
        currentPoints = [
            { x: -50, y: 40 },  // A: 左上角
            { x: 50, y: 40 },   // B: 右上角
            { x: 50, y: -40 },  // C: 右下角
            { x: -50, y: -40 }  // D: 左下角
        ];
        
        // 重置当前焦点点
        currentPointIndex = 0;
        
        updateCoordinateInputs();
        updateView();
    }
    
    // 事件监听
    kxInput.addEventListener('input', updateView);
    kyInput.addEventListener('input', updateView);
    resetBtn.addEventListener('click', resetAll);
    animateBtn.addEventListener('click', animateTransform);
    applyCoordinatesBtn.addEventListener('click', applyUserCoordinates);
    nextPointBtn.addEventListener('click', nextPoint);
    
    // 图像加载完成后初始化视图
    img.onload = function() {
        updateCoordinateInputs();
        updateView();
    };
}); 