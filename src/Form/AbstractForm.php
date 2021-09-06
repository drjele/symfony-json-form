<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\SymfonyJsonForm\Form;

use Doctrine\Common\Annotations\AnnotationReader;
use Drjele\SymfonyJsonForm\Contract\DtoInterface;
use Drjele\SymfonyJsonForm\Exception\Exception;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactory;
use Symfony\Component\Serializer\Mapping\Loader\AnnotationLoader;
use Symfony\Component\Serializer\Normalizer\ArrayDenormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

abstract class AbstractForm
{
    abstract protected function getDtoClass(): string;

    abstract protected function getRoute(): ?string;

    abstract protected function build(FormBuilder $formBuilder): void;

    final public function render(DtoInterface $dto = null): array
    {
        if (null === $dto) {
            $dtoClass = $this->getDtoClass();
            /** @var DtoInterface $dto */
            $dto = new $dtoClass();
        }

        $formName = $this->getName();

        if (\get_class($dto) !== $this->getDtoClass()) {
            throw new Exception(\sprintf('invalid dto class for form "%s"', $formName));
        }

        $formBuilder = new FormBuilder($formName, $this->getRoute());

        $this->build($formBuilder);

        $data = $this->getSerializer()->normalize($dto);

        return $formBuilder->render($data);
    }

    final public function handle(Request $request): DtoInterface
    {
        $data = $this->getData($request);

        return $this->getSerializer()->denormalize($data, $this->getDtoClass());
    }

    private function getData(Request $request): array
    {
        $content = $request->getContent();

        if (empty($content)) {
            return [];
        }

        return (new JsonEncoder())->decode($content, JsonEncoder::FORMAT)[$this->getName()] ?? [];
    }

    private function getSerializer(): Serializer
    {
        $classMetadataFactory = new ClassMetadataFactory(new AnnotationLoader(new AnnotationReader()));
        $extractor = new PropertyInfoExtractor([], [new PhpDocExtractor(), new ReflectionExtractor()]);
        $normalizers = [new ArrayDenormalizer(), new ObjectNormalizer($classMetadataFactory, null, null, $extractor)];

        $encoders = [];

        return new Serializer($normalizers, $encoders);
    }

    private function getName(): string
    {
        $className = \lcfirst((new \ReflectionClass(static::class))->getShortName());

        $position = \strrpos($className, 'Service');

        return false === $position ? $className : \substr($className, 0, $position);
    }
}
