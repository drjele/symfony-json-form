<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Test\Form;

use Drjele\Symfony\JsonForm\Test\Utility\TestDto;
use Drjele\Symfony\JsonForm\Test\Utility\TestForm;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ArrayDenormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

/**
 * @internal
 */
final class FormTest extends TestCase
{
    public function testRender(): void
    {
        $testForm = new TestForm();
        $testForm->setSerializer($this->getSerializer());

        $form = $testForm->render();

        static::assertIsArray($form);
    }

    public function testHandle(): void
    {
        $testForm = new TestForm();
        $testForm->setSerializer($this->getSerializer());

        $request = new Request();

        $dto = $testForm->handleRequest($request);

        static::assertInstanceOf(TestDto::class, $dto);
    }

    private function getSerializer(): Serializer
    {
        $extractor = new PropertyInfoExtractor([], [new PhpDocExtractor(), new ReflectionExtractor()]);
        $normalizers = [
            new ArrayDenormalizer(),
            new ObjectNormalizer(null, null, null, $extractor),
        ];

        $encoders = [new JsonEncoder()];

        return new Serializer($normalizers, $encoders);
    }
}
