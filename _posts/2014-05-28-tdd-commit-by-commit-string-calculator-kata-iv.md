---
layout: post
title: TDD – commit by commit String Calculator Kata (IV)
date: 2014-05-28 03:29
author: LaM
comments: true
categories: [Standard, TDD, TDD, TDD - String Calculator]
---
<p>Previous part in the series <a href="http://www.mfranc.com/tdd/tdd-commit-by-commit-string-calculator-kata-iii/">TDD – commit by commit String Calculator Kata (III)</a> Last time I finished on negative values requirement. This will be the "almost" last part of the series about String Calculator Kata. There was some interest in more practical TDD examples in business context with services, layers, mocks and external dependencies like database. I will start next series to cover scenarios like that. Current kata is quite simple and was just a start.</p>

<h3>Step - Ignore numbers greater or equal to 1000</h3>

<pre class="lang:c# decode:true">[Test]
public void Sum_ignores_number_greater_than_1000()
{
    var calculator = new StringCalculator();
    var value = "1,2000,1000,1003";

    var actual = calculator.SumFromString(value);

    var expected = 1;

    Assert.That(actual, Is.EqualTo(expected));
}</pre>

<p>I am expecting 1 here, all the other values are above 1000.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/0bfd7712708ae01dd3dc5eb74fe87c0cc40e7524">Commit - Test</a><br />
Based on changes from previous steps, I can just use .Where() clause to filter out the values.</p>

<pre class="lang:c# decode:true">return values.Where(x => x &lt; 1000).Sum();
</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/90640c798257cecd6ea6814a85b48f73e914a659">Commit - Implementation</a></p>

<h3>Step - Support for delimiters with any length Delimiters can be of any length with the following format</h3>

<p><strong>"//;;;\n"</strong>. Based on this input delimiter would be ';;;', of course previous requirements are still supported.</p>

<pre class="lang:c# decode:true">[Test]
public void MultiCharDelimeter_Is_Supported()
{
     var calculator = new StringCalculator();
     var value = "//;;;\n1;;;2;;;3;;;4";

     var actual = calculator.Sum(value);

     var expected = 10;

     Assert.That(actual, Is.EqualTo(expected));
}</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/60695c28ed128c31402622510fd75287d6c268e0">Commit - Test</a><br />
There are two options. I can either use brute force customised index based parsing, or I can use Regular expression. I know that if you have a problem and solve it with regexp, you suddenly have two problems :) Still I think that regexp should be fine in here.</p>

<pre class="lang:c# decode:true">Regex DelimeterRegex = new Regex("//(?&lt;delimiter>.*)\n(?&lt;value>.*)", RegexOptions.Compiled);
</pre>

<p>This regexp matches two groups 'delimiter' and 'value'. I need 'value' to extract the string with all the values. As an examples, given "//;;;\n1;;;2;;;3;;;4" delimiter - ;;; value -1;;;2;;;3;;;4 With this solution I will remove substring based extraction which was not that good.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/ffe6520929658973a8bec7a4e254f600b7b8da99">Commit - Implementation</a><br />
To support delimiter of multiple chars, I changed all of the collections from 'IEnumerable char' to 'IEnumerable string'. You can notice that there is a .Single(), that's because, based on current format and requirement, I expect only single value and delimiter. I still don't like ref keyword in 'ExtractDelimiters' method, it's an anti pattern. The only place I can think positively about 'ref / out' usability is '.TryParse()' method. To avoid 'ref', 'ExtractDelimiters' function must return more than only single string. I can either use Tuple or create new class that would encapsulate both extracted delimiters and value. To make this simple, I decided to use 'Tuple'. <a href="https://github.com/michal-franc/BlogStuff/commit/bd05a0d885d4e2cd1622f03200d1dd8ad6677002">Commit - Ref to Tuple</a> I also don't like this line of code. It just too complicated and unreadable.</p>

<pre class="lang:c# decode:true">matches.OfType&lt;Match>().Select(m => m.Groups["delimeter"].Value).Single();
</pre>

<p>Much nicer solution would be to hide this logic and extract the method.</p>

<pre class="lang:c# decode:true">var delim = this.ExtractRegexpGroup(matches, "delimeter");
extractedInput = this.ExtractRegexpGroup(matches, "value");
</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/f36f9744000af4243b27019e28a52662fe1794e7">Commit - extract regexp matches method</a></p>

<h3>Step - multiple delimiters</h3>

<pre class="lang:c# decode:true">[Test]
public void Multiple_Delimeters_Test()
{
    var calculator = new StringCalculator();
    var value = "//[*][%]\n1*2%3";

    var actual = calculator.Sum(value);

    var expected = 6;

    Assert.That(actual, Is.EqualTo(expected));
}</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/5f5b2d5c9d47dcb659ba3e9821af492fa4117fc0">Commit - Test</a> Previous solution supports only one delimiter, now We can have many delimiters separated by brackets. Current regexp in this scenario treats "[*][%]" as single delimiter. i just need to add method / regexp that will extract delimeters from this string.</p>

<pre class="lang:c# decode:true">new Regex("\\[(.?)\\]"))
</pre>

<p>This Regexp will take [&amp;][<em>] string and extract both '&amp;' and '</em>'.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/13a3bf60a045d94fdf499aed08cde775eeca58a4">Commit - Implementation</a> It is easy to make a mistake with regexp, I am not sure if all the extractions work fine, that's why i want to explore more test cases with mutliple delimiters, and multi char delimiters. To do this I ll just convert previous Test to TestCases with variables.</p>

<pre class="lang:c# decode:true">[TestCase(";;;")]
[TestCase("x")]
[TestCase("-----")]
[TestCase("123456789")]
[TestCase("              ")]
[TestCase("\r")]
[TestCase("()()()")]
[TestCase("((()))")]
[TestCase("!@#$%^^&*()_+/|`~")]
public void MultiCharDelimeter_Is_Supported(string delimiter)
{
    var calculator = new StringCalculator();
    var value = string.Format("//{0}\n1{0}2{0}3{0}4", delimiter);

    var actual = calculator.SumFromString(value);

    var expected = 10;

    Assert.That(actual, Is.EqualTo(expected));
}</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/3422fa015188e7e624a599c2b37648c4f66d7225">Commit - Test</a> Some of the delimiters looks werid, but still all the tests pass, thats a good message.</p>

<pre class="lang:c# decode:true">[TestCase(";;;","   ")]
[TestCase("x"," u")]
[TestCase("-----", "---123")]
[TestCase("123456789", "090()")]
[TestCase("              ", "")]
[TestCase("\r", "12x")]
[TestCase("()()()", "^^&*")]
[TestCase("!@#$%^^&*()_+/|`~", "123456")]
public void Multiple_Delimeters_Test(string delimiter1, string delimeter2)
{
    var calculator = new StringCalculator();
    var value = string.Format("//[{0}][{1}]\n1{0}2{1}3{0}4", delimiter1, delimeter2);

    var actual = calculator.SumFromString(value);

    var expected = 6;

    Assert.That(actual, Is.EqualTo(expected));
}</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/38f45328dfbd8748c8cdcbf00799597d4b31e21f">Edge cases mutliple chars.</a><br />
Wow with this change ale the tests are red. There has to be some problem with regexp. The extraction of single delimiters does only work for single char delimiters. I had to do little change.</p>

<pre class="lang:c# decode:true">new Regex("\\[(.+?)\\]"))</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/a0169989f14232bf275ae7544eb9707e8ec41904">Fix for edge cases</a><br />
That would be all for now. In the last post of this serie, I will do a little cleanup with some summary of whole series. I need some advice from you dear reader: - how do you feel about using regexp, any other cool solution to do all the extractions ? - do you think that usage of Tuple is ok here, or should I create a new container class in this scenario ?</p>

