function sortByQuick(){
	function swap(array, i, j) {
    	var temp = array[i];
    	array[i] = array[j];
    	array[j] = temp;
  	}
  	/*
  	*	分区操作, 每一个数据都和基准值进行比较，小于基准值则将该数据移动到左边
    *   
  	*	@iLeft , 子数组的起始下标
  	*	@iRight , 子数组的结束下标
  	*/
	function partition(array,iLeft,iRight){
		var pivot = iRight;	//选择最后一个元素作为基准
		var index = iLeft;  // 标记

		//遍历基准以外的元素
		for(var i = iLeft; i < iRight; i++){
			if(array[i] < array[pivot]){	//将小于基准的项移
				swap(array,i,index);
				index++; 
			}
		}
		// 经过for循环的遍历比较，小于pivot的元素都移动到了数组左边，index的值就是小于pivot的元素个数，
        // 换句话说，index 就是pivot在最终排序结果中的位置
        // 所以将基准元素移动到index的位置
		swap(array,index,iRight);
		return index;
	}

	/*
	*	递归实现快速排序
	*/
	function quickSortRecursion(array,iLeft,iRight){
		if(iLeft >= iRight)
			return;

		var pivotIndex = partition(array,iLeft,iRight);
		quickSortRecursion(array,iLeft,pivotIndex - 1);
		quickSortRecursion(array,pivotIndex + 1,iRight);
	}
    /*
	*	迭代实现快速排序
	*/
	function quickSortIteration(array,iLeft,iRight){
		var partitionArray = new Array();	//存储每次分区操作的 left 和 right
			partitionArray.push([iLeft,iRight]) ;

		while(partitionArray.length > 0){
			var tmp = partitionArray.pop(),
				low = tmp[0],
				high = tmp[1];
			if(low < high){ 
				var pivotIndex = partition(array,low,high);
				partitionArray.push([low,pivotIndex - 1]);	
				partitionArray.push([pivotIndex + 1,high]);
			}
			
		}

	}

	function sort(){
		var array = [];
		for(var i = 0;i<10;i++){
			var a = Math.floor(Math.random() * 100 );
			array.push(a);
		}
		console.log('原始数组：'+array);
		quickSortRecursion(array,0,array.length - 1);
		// quickSortIteration(array,0,array.length - 1);
		console.log('排序数组：'+ array);
	}

	sort();
}



var arr = [93,85,90,34,3,44,45,42,50,52]


[34, 3, 44, 45, 42, 50, 52, 85, 90, 93]


[34, 3, 44, 45, 42, 50, 93, 85, 90, 52]

