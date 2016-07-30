---
layout: post
title: LockBits vs Get Pixel Set Pixel - Performance
date: 2009-11-22 00:02
author: LaM
comments: true
categories: [.net, lockbits, Programming]
---
<p align="justify">When using <strong>GDI+</strong> method you can <strong>optimize</strong> the process of bitmap manipulation  seven  times.I am implementing an image scaling algorithm at my University <a href="http://lammichalfranc.wordpress.com/2009/11/20/seam-carving-part-1/"><strong>Seam Carving</strong></a> . While working on this project I realized that simply accessing pixels by the <strong>GetPixel</strong> and <strong>SetPixel</strong> methods is too slow.</p>

<h2>GetPixel , SetPixel</h2>
<p align="justify">This is a really easy solution. We have two functions <strong>GetPixel</strong> and <strong>SetPixel</strong> both  have x and y coordinate as argument. <strong>GetPixel</strong> returns a color and <strong>SetPixel</strong> sets a color on the coordinate.</p>

<pre class="lang:c# decode:true">GetPixel(int x,int y)
SetPixel(int x,int y,Color color)</pre>
<p align="justify">With the use of those functions, we can easily iterate through all the <strong>pixels</strong> in the image by simply modifying the x and y variable.</p>

<pre class="lang:c# decode:true">for (int y =0; y &lt; _bmp.Height; y++)
{
    for (int x =0; x &lt; _bmp.Width; x++)
    {
        _bmp.SetPixel(x,y,color);
        Color c = _bmp.GetPixel(x,y);
     }
}</pre>
<h3>Pros</h3>
- Code is more readable.
- Easy to implement and use.
<h3>Cons</h3>
-Low efficiency.
<p align="justify">This method is really great for simple graphical operations when speed isn't important. In my scenario with the <strong>Seam Carving</strong> algorithm, I had an <strong>efficiency</strong> problem using this method. <strong>Seam Carving</strong> algorithm is making a lot of calculations in order to find seams. The time is growing exponentially with the size of the image.</p>
<p align="justify"></p>

<h2>GDI+ and LockBits.</h2>
<p align="justify">Bitmap class contains two methods <strong>LockBits</strong> and <strong>UnlockBits</strong> , with them, we can get access and work directly on the memory. <strong>LockBits</strong> method returns <strong>BitmapData</strong> object, which is used to describe the memory sector. In this method, we have to use the pointers. That's why our class should have an unsafe keyword.</p>

<pre class="lang:c# decode:true">BitmapData _bmd = _bmp.LockBits(new Rectangle(0, 0, _bmp.Width,_bmp.Height) , ImageLockMode ReadWrite, _bmp.PixelFormat);</pre>
<p align="justify"></p>
<p align="justify">With BitmapData object we need to define some variables.</p>

<pre class="lang:c# decode:true">int _pixelSize =3;
byte* _current =(byte*)(void*)_bmd.Scan0;
int _nWidth = _bmp.Width * _pixelSize;
int _nHeight = _bmp.Height;</pre>
- ScanO memory address which defines the beginning of our Bitmap
- _nWidth how many bots in one row
With this we can iterate through the image.
<pre class="lang:c# decode:true">for (int y =0; y &lt; _nHeight; y++)
{
    for (int x =0; x &lt; _nWidth;x++ )
    {
         if (x % _pixelSize ==0|| x ==0)
        {
             SetColor(new Color.Black);
         }
      _current++;
     }
}</pre>
<p align="justify">We have to remember that current variable is only a pointer  to a memory address</p>

<pre class="lang:c# decode:true"> if (x % _pixelSize ==0|| x ==0)</pre>
<p align="justify">This condition ensures that the current will always point to the beginning of the next pixel. In my example pixel is represented by  three bytes, this value is stored in the _pixelSize variable.</p>
With _current pointer we can access pixel values by using the indexer.
<pre class="lang:c# decode:true">void SetColor(,Color color)
{
     _current[0]= color.R;
     _current [1] = color.G;
     _current [2] = color.B;
}</pre>
<h3>Pros:</h3>
- Speed
<h3>Cons:</h3>
<p align="justify">-Code is confusing but we can wrap the logic in readable functions</p>
- Implementation is complicated in the beginning
<p align="justify">- unmanaged code</p>

<h2>Comparision between Gdi+ Lockbits and GetPixel SetPixel</h2>
<table border="0" frame="VOID" rules="NONE" cellspacing="0"><colgroup><col width="86" /><col width="136" /><col width="149" /></colgroup>
<tbody>
<tr>
<td align="LEFT" width="86" height="18"></td>
<td align="LEFT" bgcolor="#CCCCCC" width="136">GDI+ LockBits (ms)</td>
<td align="LEFT" bgcolor="#CCCCCC" width="149">GetPixel SetPixel (ms)</td>
</tr>
<tr>
<td align="LEFT" bgcolor="#CCCCCC" height="18">Read Pixel</td>
<td align="RIGHT" bgcolor="#33CC66">21</td>
<td align="RIGHT">157</td>
</tr>
<tr>
<td align="LEFT" bgcolor="#CCCCCC" height="18">Write Pixel</td>
<td align="RIGHT" bgcolor="#33CC66">15</td>
<td align="RIGHT">153</td>
</tr>
<tr>
<td align="LEFT" bgcolor="#CCCCCC" height="18">Iterate Image</td>
<td align="RIGHT" bgcolor="#33CC66">226</td>
<td align="RIGHT">1496</td>
</tr>
</tbody>
</table>
<p align="justify"><a href="http://lammichalfranc.files.wordpress.com/2009/11/wykresikbmp1.jpg"><img class="alignnone size-full wp-image-55" title="wykresikBmp1" src="http://lammichalfranc.files.wordpress.com/2009/11/wykresikbmp1.jpg" alt="" width="450" height="278" /></a></p>
<p align="justify">As you can see the <strong>GDI</strong>+ <strong>Lockbits</strong> are almost seven times faster than <strong>GetPixel</strong> <strong>SetPixel</strong> method</p>
<p align="justify"><a href="https://www.assembla.com/code/projektyLM/subversion/nodes/SeamCarv"><strong>Link to the project.</strong></a></p>
&nbsp;
