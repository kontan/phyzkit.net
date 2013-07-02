module Sylvester{
	class Matrix{
		static create(elements:number[][]):Matrix;
		static $M(elements:number[][]):Matrix;
		static I(n:number):Matrix;
		static Diagonal(elements:number[]);
		static Rotation(theta:number, a?:number[]);
		static RotationX(t:number);
		static RotationY(t:number);
		static RotationZ(t:number);
		static Random(n:number, m:number);
		static Zero(n:number, m:number);		
		elements:number[][];
		e(i:number,j:number):number;
		row(i:number):number;
		col(j:number):number;
		dimensions():{rows:number;cols:number;};
		rows():number;
		cols():number;
		eql(matrix:Matrix):bool;
		dup():Matrix;
		map(fn:(e:number, i:number, j:number)=>number, context?:any):Matrix;
		isSameSizeAs(matrix:Matrix):bool;
		add(matrix:Matrix):Matrix;
		subtract(matrix:Matrix):Matrix;
		canMultiplyFromLeft(matrix):bool;
		multiply(matrix:Matrix):Matrix;
		minor(a:number, b:number, c:number, d:number):Matrix;
		transpose():Matrix;
		isSquare():bool;
		max():number;
		indexOf(x:number):{i:number;j:number;};
		diagonal():number;
		toRightTriangular():Matrix;
		determinant():number;
		isSingular():bool;
		trace():number;
		rank():number;
		augment(matrix:Matrix):Matrix;
		inverse():Matrix;
		round():Matrix;
		snapTo(x:number):Matrix;
		inspect():string;
		setElements(els:number[][]):Matrix;

		toUpperTriangular():Matrix;
		det():number;
		tr():number;
		rk();number;
		inv():Matrix;
		x(matrix:Matrix):Matrix;
	}
}